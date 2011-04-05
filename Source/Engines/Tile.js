/*
---

name: "Engines.Tile"

description: "Helper for building tile maps (e.g. for Tetris or ur's favorite Dune II - http://en.wikipedia.org/wiki/Tile_engine)"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Context2D
	- Shapes.Rectangle
	- LibCanvas.Behaviours.Drawable

provides: Engines.Tile

...
*/

LibCanvas.namespace('Engines').Tile = atom.Class({
	Implements: [
		LibCanvas.Behaviors.Drawable,
		atom.Class.Events
	],
	tiles : {},
	rects : {},
	first : true,

	cellWidth  : 0,
	cellHeight : 0,
	margin : 0,
	initialize : function (canvas) {
		if (canvas instanceof LibCanvas) {
			this.libcanvas = canvas;
			canvas.freeze();
			canvas = canvas.elem;
		}
		this.elem = canvas;
		this.ctx  = canvas.getContext('2d-libcanvas');
	},
	checkMatrix : function (matrix) {
		if (!matrix.length) throw new TypeError('Matrix should have at least one row');
		var width = matrix[0].length;
		if (!width) throw new TypeError('Matrix should have at least one cell');
		for (var i = matrix.length; i--;) if (matrix[i].length != width) {
			throw new TypeError('Line ' + i + ' width is ' + matrix[i].length + '. Should be ' + width);
		}
		return true;
	},
	createMatrix : function (width, height, fill) {
		var matrix = new Array(height);
		for (var y = height; y--;) matrix[y] = Array.fill(width, fill);
		this.setMatrix(matrix);
		return this;
	},
	setMatrix : function (matrix) {
		this.first = true;
		this.checkMatrix(matrix);
		this.matrix    = matrix;
		this.oldMatrix = matrix.clone();
		return this;
	},
	addTile : function (index, fn) {
		this.tiles[index] = fn;
		return this;
	},
	addTiles : function (tiles) {
		for (var i in tiles) this.addTile(i, tiles[i]);
		return this;
	},
	setSize : function (cellWidth, cellHeight, margin) {
		this.cellWidth  = cellWidth;
		this.cellHeight = cellHeight;
		this.margin = margin || 0;
		return this;
	},
	update : function () {
		var changed = false, old = this.oldMatrix;
		this.each(function (cell) {
			if (this.first || old[cell.y][cell.x] != cell.t) {
				changed = true;
				this.drawCell(cell);
				old[cell.y][cell.x] = cell.t;
			}
		}.context(this));
		this.first = false;
		if (changed) {
			this.fireEvent('update');
			this.libcanvas && this.libcanvas.showBuffer();
		}
		return this;
	},
	getRect : function (cell) {
		if (!this.rects['0.0']) this.each(function (cell) {
			var index = cell.x + '.' + cell.y;
			this.rects[index] = new LibCanvas.Shapes.Rectangle({
				from : [
					(this.cellWidth  + this.margin) * cell.x,
					(this.cellHeight + this.margin) * cell.y
				],
				size : [this.cellWidth, this.cellHeight]
			});
		});
		return this.rects[cell.x + '.' + cell.y];
	},
	getCell : function (point) {
		point = LibCanvas.Point.from(arguments);
		var x = parseInt(point.x / (this.cellWidth  + this.margin)),
			y = parseInt(point.y / (this.cellHeight + this.margin)),
			row = this.matrix[y];
		return (row && x in row) ? {
			t : row[x],
			x : x,
			y : y
		} : null;
	},
	drawCell : function (cell /*{t,x,y}*/) {
		var rect = this.getRect(cell), fn = this.tiles[cell.t];
		if (!fn && fn !== 0 && 'default' in this.tiles) fn = this.tiles['default'];
		this.ctx.clearRect(rect);
		if (atom.dom.isElement(fn)) {
			this.ctx.drawImage({
				image : fn,
				draw  : rect
			});
		} else if (typeof fn == 'function') {
			fn(this.ctx, rect, cell);
		} else if (fn != null) {
			this.ctx.fill(rect, fn);
		}
		return this;
	},
	each : function (fn) {
		var m = this.matrix, height = this.height(), width = this.width(), x, y;
		for (y = 0; y < height; y++) for (x = 0; x < width; x++) {
			fn.call(this, {
				t : m[y][x],
				x : x,
				y : y
			});
		}
		return this;
	},
	width : function () {
		return (this.matrix[0] && this.matrix[0].length) || 0;
	},
	height : function () {
		return this.matrix.length || 0;
	},
	draw: function () {
		this.update();
	},
	toString: Function.lambda('[object LibCanvas.Engines.Tile]')
});