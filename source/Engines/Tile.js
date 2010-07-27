LibCanvas.Engines.Tile = new Class({
	Implements : [LibCanvas.Interfaces.Bindable],
	tiles : {},
	rects : {},
	first : true,

	width  : 0,
	height : 0,
	margin : 0,
	initialize : function (canvas) {
		this.elem = canvas;
		this.ctx  = canvas.getContext('2d-libcanvas');
	},
	checkMatrix : function (matrix) {
		if (!matrix.length) {
			throw 'Matrix should have at least one row';
		}
		var width = matrix[0].length;
		if (!width) {
			throw 'Matrix should have at least one cell';
		}
		matrix.each(function (line, i) {
			if (line.length != width) {
				throw 'Line ' + i + ' width is ' + line.length + '. Should be ' + width;
			}
		});
		return true;
	},
	createMatrix : function (width, height, fill) {
		var matrix = [];
		height.times(function () {
			var line = [];
			width.times(function () {
				line.push(fill);
			});
			matrix.push(line);
		});
		this.setMatrix(matrix);
		return matrix;
	},
	setMatrix : function (matrix) {
		this.first = true;
		this.checkMatrix(matrix);
		this.matrix    = matrix;
		this.oldMatrix = this.cloneMatrix(matrix);
	},
	cloneMatrix : function (matrix) {
		var nexMatrix = [];
		matrix.each(function (line, i) {
			nexMatrix[i] = $extend([], line);
		});
		return nexMatrix;
	},
	addTile : function (index, fn) {
		this.tiles[index] = fn;
		return this;
	},
	addTiles : function (tiles) {
		for (var i in tiles) {
			this.addTile(i, tiles[i]);
		}
		return this;
	},
	setSize : function (width, height, margin) {
		this.width  = width;
		this.height = height;
		this.margin = margin;
		return this;
	},
	update : function () {
		var changed = false;
		var old     = this.oldMatrix;
		this.each(function (cell) {
			var flag = (this.first || old[cell.y][cell.x] != cell.t);
			if (flag) {
				changed = true;
				this.drawCell(cell);
				this.oldMatrix[cell.y][cell.x] = cell.t;
			}
		}.bind(this));
		this.first = false;
		if (changed) {
			this.bind('update');
		}
		return this;
	},
	getRect : function (cell) {
		if (!this.rects['0.0']) {
			this.each(function (cell) {
				var index = cell.x + '.' + cell.y;
				this.rects[index] = new LibCanvas.Shapes.Rectangle({
					from : [
						(this.width  + this.margin) * cell.x,
						(this.height + this.margin) * cell.y,
					],
					size : [this.width, this.height]
				});
			});
		}
		return this.rects[cell.x + '.' + cell.y];
	},
	getCell : function (point) {
		var x = (point.x / (this.width  + this.margin)).floor();
		var y = (point.y / (this.height + this.margin)).floor();
		if (this.matrix[y] && this.matrix[y][x]) {
			return {
				t : this.matrix[y][x],
				x : x,
				y : y
			};
		} else {
			return null;
		}
	},
	drawCell : function (cell /*{t,x,y}*/) {
		var rect = this.getRect(cell);
		var fn   = this.tiles[cell.t];
		this.ctx.clearRect(rect);
		if ($type(fn) == 'element') {
			this.ctx.cachedDrawImage({
				image : fn,
				draw  : rect
			});
		} else if ($type(fn) == 'function') {
			fn(this.ctx, rect, cell.t);
		} else {
			this.ctx.fill(rect, fn);
		}
		return this;
	},
	each : function (fn) {
		var m = this.matrix;
		for (var y = 0; y < m.length; y++) {
			for (var x = 0; x < m[y].length; x++) {
				fn.call(this, {
					t : m[y][x],
					x : x,
					y : y
				});
			}
		}
		return this;
	}
});