/*
---

name: "Point"

description: "A X/Y point coordinates encapsulating class"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Geometry
	- Utils.Math

provides: Point

...
*/

var Point = LibCanvas.Point = function () {

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

return Class({
	Extends: Geometry,

	Static: { shifts: shifts },

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
		this.x = x == null ? null : Number(x);
		this.y = y == null ? null : Number(y);
		return this;
	},
	move: function (distance, reverse) {
		distance = this.invertDirection(Point(distance), reverse);
		this.x += distance.x;
		this.y += distance.y;

		return this.parent(distance, false);
	},
	moveTo : function (newCoord) {
		return this.move(this.diff(Point(arguments)));
	},
	angleTo : function (point) {
		var diff = Point(arguments).diff(this);
		return Math.atan2(diff.y, diff.x).normalizeAngle();
	},
	distanceTo : function (point) {
		var diff = Point(arguments).diff(this);
		return Math.hypotenuse(diff.x, diff.y);
	},
	diff : function (point) {
		return new Point(arguments).move(this, true);
	},
	rotate : function (angle, pivot) {
		pivot = Point(pivot || {x: 0, y: 0});
		if (this.equals(pivot)) return this;
		
		var radius = pivot.distanceTo(this);
		var sides  = pivot.diff(this);
		// TODO: check, maybe here should be "sides.y, sides.x" ?
		var newAngle = Math.atan2(sides.x, sides.y) - angle;

		return this.moveTo({
			x : newAngle.sin() * radius + pivot.x,
			y : newAngle.cos() * radius + pivot.y
		});
	},
	scale : function (power, pivot) {
		pivot = Point(pivot || {x: 0, y: 0});
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
	get neighbours () {
		return this.getNeighbours( true );
	},
	getNeighbours: function (corners, asObject) {
		var shifts = ['t', 'l', 'r', 'b'], result, i, dir;

		if (corners) shifts.push('tl', 'tr', 'bl', 'br');

		if (asObject) {
			result = {};
			for (i = shifts.length; i--;) {
				dir = shifts[i];
				result[dir] = this.getNeighbour( dir );
			}
			return result;
		} else {
			return shifts.map(this.getNeighbour.bind(this));
		}
	},
	equals : function (to, accuracy) {
		to = Point(to);
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
		this.x += 0.5 - (this.x - this.x.floor());
		this.y += 0.5 - (this.y - this.y.floor());
		return this;
	},
	clone : function () {
		return new this.self(this);
	},
	dump: function () {
		return '[Point(' + this.x + ', ' + this.y + ')]';
	},
	toString: Function.lambda('[object LibCanvas.Point]')
});

}();