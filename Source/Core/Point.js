/*
---

name: "Point"

description: "A X/Y point coordinates encapsulating class"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Geometry
	- Utils.Math

provides: Point

...
*/

new function (undefined) {

var shifts = {
	top    : {x: 0, y:-1},
	right  : {x: 1, y: 0},
	bottom : {x: 0, y: 1},
	left   : {x:-1, y: 0},
	t      : {x: 0, y:-1},
	r      : {x: 1, y: 0},
	b      : {x: 0, y: 1},
	l      : {x:-1, y: 0},
	tl     : {x:-1, y:-1},
	tr     : {x: 1, y:-1},
	bl     : {x:-1, y: 1},
	br     : {x: 1, y: 1}
};

var Point = LibCanvas.Point = atom.Class({
	Extends: LibCanvas.Geometry,
	set : function (x, y) {
		var args = arguments;
		if (atom.typeOf(x) == 'arguments') {
			args = x;
			x = args[0];
			y = args[1];
		}
		if (args.length != 2) {
			if (x && x[0] !== undefined && x[1] !== undefined) {
				y = x[1];
				x = x[0];
			} else if (x && x.x !== undefined && x.y !== undefined) {
				y = x.y;
				x = x.x;
			} else {
				//atom.log('Wrong Arguments In Point.Set:', arguments);
				throw new TypeError('Wrong Arguments In Point.Set: [' + atom.toArray(arguments).join(', ') + ']');
			}
		}
		this.x = x == null ? x : Number(x);
		this.y = y == null ? y : Number(y);
		return this;
	},
	move: function (distance, reverse) {
		distance = this.self.from(distance);
		distance = this.invertDirection(distance, reverse);
		this.x += distance.x;
		this.y += distance.y;

		return this.parent(distance, false);
	},
	moveTo : function (newCoord) {
		return this.move(this.diff(newCoord));
	},
	angleTo : function (point) {
		var diff = Point.from(arguments).diff(this);
		return Math.atan2(diff.y, diff.x).normalizeAngle();
	},
	distanceTo : function (point) {
		var diff = Point.from(arguments).diff(this);
		return Math.hypotenuse(diff.x, diff.y);
	},
	diff : function (point) {
		return Point.from(arguments)
			.clone().move(this, true);
	},
	rotate : function (angle, pivot) {
		pivot = Point.from(pivot || {x: 0, y: 0});
		if (this.equals(pivot)) return this;
		
		var radius = pivot.distanceTo(this);
		var sides  = pivot.diff(this);
		var newAngle = Math.atan2(sides.x, sides.y) - angle;

		return this.moveTo({
			x : newAngle.sin() * radius + pivot.x,
			y : newAngle.cos() * radius + pivot.y
		});
	},
	scale : function (power, pivot) {
		pivot = Point.from(pivot || {x: 0, y: 0});
		var diff = this.diff(pivot), isObject = typeof power == 'object';
		return this.moveTo({
			x : pivot.x - diff.x  * (isObject ? power.x : power),
			y : pivot.y - diff.y  * (isObject ? power.y : power)
		});
	},
	alterPos : function (arg, fn) {
		return this.moveTo({
			x: fn(this.x, typeof arg == 'object' ? arg.x : arg),
			y: fn(this.y, typeof arg == 'object' ? arg.y : arg)
		});
	},
	mul : function (arg) {
		return this.alterPos(arg, function(a, b) {
			return a * b;
		});
	},
	getNeighbour : function (dir) {
		return this.clone().move(shifts[dir]);
	},
	equals : function (to, accuracy) {
		to = Point.from(to);
		return accuracy == null ? (to.x == this.x && to.y == this.y) :
			(this.x.equals(to.x, accuracy) && this.y.equals(to.y, accuracy));
	},
	toObject: function () {
		return {
			x: this.x,
			y: this.y
		};
	},
	snapToPixel: function () {
		this.x += 1 - (this.x - this.x.floor()) - 0.5;
		this.y += 1 - (this.y - this.y.floor()) - 0.5;
		return this;
	},
	clone : function () {
		return new Point(this);
	},
	toString: Function.lambda('[object LibCanvas.Point]')
});

};