LibCanvas.Engines.TopDown = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	Implements : [
		LibCanvas.Interfaces.MouseListener
	],
	
	width  : 0,
	height : 0,
	cellSize : function (width, height) {
		this.width  = width;
		this.height = height;
		return this;
	},

	createMap : function (matrix) {
		var w = this.width * matrix[0].length;
		var h = this.height * matrix.length
		this.map = new LibCanvas.Engines.Tile(
			LibCanvas.Buffer(w, h)
		);
		this.setShape(new LibCanvas.Shapes.Rectangle(0,0,w,h));
		this.map.setMatrix(matrix);
		this.map.setSize(this.width, this.height, 0);
		for (var i in this.cells) {
			this.map.addTile(i, this.cells[i].fn);
		}
		return this.map;
	},

	/**
	 * index : {
	 *	fn, traverse [unit.types]
	 * }
	 */
	cells : {},
	addCells : function (cells) {
		$extend(this.cells, cells);
		return this;
	},

	units : {},
	addUnits : function (units) {
		$extend(this.units, units);
		return this;
	},

	draw : function () {
		this.canvas.ctx.drawImage(this.map.elem, 0, 0);
	},

	getCoord : function (coord) {
		return {
			x : this.width  * coord.x,
			y : this.height * coord.y
		};
	}
});