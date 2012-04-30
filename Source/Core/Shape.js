/*
---

name: "Shape"

description: "Abstract class LibCanvas.Shape defines interface for drawable canvas objects"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Geometry
	- Point

provides: Shape

...
*/

var shapeTestBuffer = function () {
	if (!shapeTestBuffer.buffer) {
		return shapeTestBuffer.buffer = LibCanvas.buffer(1, 1, true);
	}
	return shapeTestBuffer.buffer;
};

/** @class Shape */
var Shape = declare( 'LibCanvas.Shape', Geometry, {
	set        : 'abstract',
	hasPoint   : 'abstract',
	processPath: 'abstract',
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	},
	// Методы ниже рассчитывают на то, что в фигуре есть точки from и to
	getCoords : function () {
		return this.from;
	},
	/** @returns {LibCanvas.Shape} */
	grow: function (size) {
		if (typeof size == 'number') {
			size = new Point(size/2, size/2);
		} else {
			size = new Point(size.x/2, size.y/2);
		}

		this.from.move(size, true);
		this. to .move(size);
		return this;
	},
	get x () { return this.from.x },
	get y () { return this.from.y },
	set x (x) {
		return this.move(new Point(x - this.x, 0));
	},
	set y (y) {
		return this.move(new Point(0, y - this.y));
	},
	get bottomLeft () {
		return new Point(this.from.x, this.to.y);
	},
	get topRight() {
		return new Point(this.to.x, this.from.y);
	},
	get center() {
		var from = this.from, to = this.to;
		return new Point( (from.x + to.x) / 2, (from.y + to.y) / 2 );
	},
	getBoundingRectangle: function () {
		return new Rectangle( this.from, this.to );
	},
	getCenter : function () {
		return this.center;
	},
	move : function (distance, reverse) {
		this.from.move(distance, reverse);
		this. to .move(distance, reverse);
		return this;
	},
	equals : function (shape, accuracy) {
		return shape instanceof this.constructor &&
			shape.from.equals(this.from, accuracy) &&
			shape.to  .equals(this.to  , accuracy);
	},
	clone : function () {
		return new this.constructor(this.from.clone(), this.to.clone());
	},
	dumpPoint: function (point) {
		return '[' + point.x + ', ' + point.y + ']';
	},
	dump: function (shape) {
		if (!shape) return this.toString();
		return '[shape '+shape+'(from'+this.dumpPoint(this.from)+', to'+this.dumpPoint(this.to)+')]';
	}
});