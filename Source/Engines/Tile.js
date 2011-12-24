/*
---

name: "Engines.Tile"

description: "Helper for building tile maps (e.g. for Tetris or ur's favorite Dune II - http://en.wikipedia.org/wiki/Tile_engine)"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

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

var Tile = LibCanvas.Engines.Tile = Class({
	Implements: [ Drawable, Class.Events ],

	first : true,

	cellWidth  : 0,
	cellHeight : 0,
	margin : 0,
	initialize : function (canvas) {
		this.tiles = {};
		this.rects = {};

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
		if (typeof width == 'object') {
			fill   = 'fill' in width ? width.fill : height;
			height = width.height;
			width  = width.width;
		}

		this.setMatrix( Array.fillMatrix( width, height, fill ) );
		return this;
	},
	createPoints: function () {
		this.points = new Array(this.height);
		var y, x, p, ps = this.points, h = this.height, w = this.width;

		for (y = 0, h; y < h; y++) {
			ps[y] = new Array(w);
			for (x = 0, w; x < w; x++) {
				p = ps[y][x] = new Tile.Point(x, y);
				p.engine = this;
			}
		}

		return this;
	},
	setMatrix : function (matrix) {
		var w = this.width, h = this.height;
		this.first = true;
		this.checkMatrix(matrix);

		this.matrix    = matrix;
		this.oldMatrix = matrix.clone();
		if (w != this.width || h != this.height) this.createPoints();
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
		if (typeof cellWidth === 'object') {
			margin = 'margin' in cellWidth ? cellWidth.margin : cellHeight;
			cellHeight = cellWidth.height;
			cellWidth  = cellWidth.width;
		}
		this.cellWidth  = cellWidth;
		this.cellHeight = cellHeight;
		this.margin = margin || 0;
		return this;
	},
	countSize: function () {
		var margin = this.margin;
		return {
			width : (this.cellWidth  + margin ) * this.width  - margin,
			height: (this.cellHeight + margin ) * this.height - margin
		};
	},
	update : function () {
		var changed = false, old = this.oldMatrix;
		this.each(function (cell) {
			if (this.first || old[cell.y][cell.x] != cell.value) {
				changed = true;
				this.drawCell(cell);
				old[cell.y][cell.x] = cell.t;
			}
		}.bind(this));
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
			this.rects[index] = new Rectangle(
				(this.cellWidth  + this.margin) * cell.x,
				(this.cellHeight + this.margin) * cell.y,
				this.cellWidth,
				this.cellHeight
			);
		});
		return this.rects[cell.x + '.' + cell.y];
	},
	getCell : function (point) {
		point = Point(arguments);
		if (point.x < 0 || point.y < 0) return null;
		
		var
			x = parseInt(point.x / (this.cellWidth  + this.margin)),
			y = parseInt(point.y / (this.cellHeight + this.margin)),
			row = this.points[y];
		return row ? row[x] : null;
	},
	drawCell : function (cell /*{t,x,y}*/) {
		var rect = this.getRect(cell), fn = this.tiles[cell.value];
		if (!fn && fn !== 0 && 'default' in this.tiles) fn = this.tiles['default'];
		this.ctx.clearRect(rect);
		if (atom.dom.isElement(fn)) {
			this.ctx.drawImage( fn, rect );
		} else if (typeof fn == 'function') {
			fn.call( this, this.ctx, rect, cell );
		} else if (fn != null) {
			this.ctx.fill( rect, fn );
		}
		return this;
	},
	each : function (fn) {
		var p = this.points, height = this.height, width = this.width, x, y;
		for (y = 0; y < height; y++) for (x = 0; x < width; x++) {
			fn.call(this, p[y][x]);
		}
		return this;
	},
	get width () {
		return (this.matrix && this.matrix[0] && this.matrix[0].length) || 0;
	},
	get height () {
		return this.matrix && this.matrix.length || 0;
	},
	draw: function () {
		this.update();
	},
	toString: Function.lambda('[object LibCanvas.Engines.Tile]')
});

Tile.Point = Class({
	Extends: Point,

	engine: null,

	get value () {
		return this.engine.matrix[this.y][this.x];
	},

	set value (value) {
		this.engine.matrix[this.y][this.x] = value;
	},

	get exists() {
		var row = this.engine.matrix[this.y];
		return row != null && row[this.x] != null;
	},

	// @deprecated
	get t () {
		return this.value;
	},

	getNeighbour : function (dir) {
		var shift = this.self.shifts[dir];
		if (shift) {
			var row = this.engine.points[this.y + shift.y];
			if (row) return row[this.x + shift.x] || null;
		}
		return null;
	},

	getNeighbours: function (corners, asObject) {
		var nb = this.parent.apply( this, arguments );

		if (Array.isArray( nb )) {
			return nb.clean();
		} else {
			for (var i in nb) if (nb[i] == null) delete nb[i];
		}
		return nb;
	},

	clone: function () {
		var clone = this.parent();
		clone.engine = this.engine;
		return clone;
	}
});
