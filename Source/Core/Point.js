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

provides: Point

...
*/

/** @class Point */
var Point = LibCanvas.declare( 'LibCanvas.Point', 'Point', Geometry, {
	x: 0,
	y: 0,

	/**
	 *   new Point(1, 1);
	 *   new Point([1, 1]);
	 *   new Point({x:1, y:1});
	 *   new Point(point);
	 * @constructs
	 * @param {Number} x
	 * @param {Number} y
	 * @returns {Point}
	 */
	set : function (x, y) {
		if (arguments.length != 2) {
			if (atom.core.isArrayLike(x)) {
				y = x[1];
				x = x[0];
			} else if (x && x.x != null && x.y != null) {
				y = x.y;
				x = x.x;
			} else {
				throw new TypeError( 'Wrong Arguments In Point.Set' );
			}
		}

		this.x = Number(x);
		this.y = Number(y);
		return this;
	},
	/** @returns {Point} */
	move: function (distance, reverse) {
		distance = this.cast(distance);
		reverse  = reverse ? -1 : 1;
		this.x += distance.x * reverse;
		this.y += distance.y * reverse;
		return this;
	},
	/** @returns {Point} */
	moveTo : function (point) {
		return this.move(this.diff(this.cast(point)));
	},
	/** @returns {Number} */
	angleTo : function (point) {
		var diff = this.cast(point).diff(this);
		return atom.math.normalizeAngle( Math.atan2(diff.y, diff.x) );
	},
	/** @returns {Number} */
	distanceTo : function (point) {
		var diff = this.cast(point).diff(this);
		return atom.math.hypotenuse(diff.x, diff.y);
	},
	/** @returns {Boolean} */
	checkDistanceTo : function (point, distance, equals) {
		var deltaX, deltaY, realDistanceSq, maxDistanceSq;

		deltaX = Math.abs(this.x - point.x);
		if (deltaX > distance) return false;

		deltaY = Math.abs(this.y - point.y);
		if (deltaY > distance) return false;

		realDistanceSq = deltaX*deltaX + deltaY*deltaY;
		maxDistanceSq  = distance*distance;

		return (realDistanceSq < maxDistanceSq) ||
			(equals && realDistanceSq == maxDistanceSq)
	},
	/** @returns {Point} */
	diff : function (point) {
		return new this.constructor(point).move(this, true);
	},
	/** @returns {Point} */
	rotate : function (angle, pivot) {
		pivot = pivot ? this.cast(pivot) : new this.constructor(0, 0);
		if (this.equals(pivot)) return this;

		var radius = pivot.distanceTo(this);
		var sides  = pivot.diff(this);
		// TODO: check, maybe here should be "sides.y, sides.x" ?
		var newAngle = Math.atan2(sides.x, sides.y) - angle;

		return this.moveTo({
			x : Math.sin(newAngle) * radius + pivot.x,
			y : Math.cos(newAngle) * radius + pivot.y
		});
	},
	/** @returns {Point} */
	scale : function (power, pivot) {
		pivot = pivot ? this.cast(pivot) : new this.constructor(0, 0);

		var diff = this.diff(pivot), isObject = typeof power == 'object';
		return this.moveTo({
			x : pivot.x - diff.x  * (isObject ? power.x : power),
			y : pivot.y - diff.y  * (isObject ? power.y : power)
		});
	},
	/** @returns {Point} */
	alterPos : function (arg, fn) {
		return this.moveTo({
			x: fn(this.x, typeof arg == 'object' ? arg.x : arg),
			y: fn(this.y, typeof arg == 'object' ? arg.y : arg)
		});
	},
	/** @returns {Point} */
	mul : function (arg) {
		return this.alterPos(arg, function(a, b) {
			return a * b;
		});
	},
	/** @returns {Point} */
	getNeighbour : function (dir) {
		return this.clone().move(this.constructor.shifts[dir]);
	},
	/** @returns {Point[]} */
	get neighbours () {
		return this.getNeighbours( true );
	},
	/** @returns {Point[]} */
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
	/** @returns {boolean} */
	equals : function (to, accuracy) {
		to = this.cast(to);
		if (accuracy == null) {
			return to.x == this.x && to.y == this.y;
		}
		return atom.number.equals(this.x, to.x, accuracy)
			&& atom.number.equals(this.y, to.y, accuracy);
	},
	/** @returns {object} */
	toObject: function () {
		return { x: this.x, y: this.y };
	},
	toArray: function () {
		return [ this.x, this.y ];
	},
	/** @returns {Point} */
	invoke: function (method) {
		this.x = this.x[method]();
		this.y = this.y[method]();
		return this;
	},
	/** @returns {Point} */
	map: function (fn, context) {
		this.x = fn.call(context || this, this.x, 'x', this);
		this.y = fn.call(context || this, this.y, 'y', this);
		return this;
	},
	/** @returns {Point} */
	mean: function (points) {
		var l = points.length, i = l, x = 0, y = 0;
		while (i--) {
			x += points[i].x;
			y += points[i].y;
		}
		return this.set(x/l, y/l);
	},
	/** @returns {Point} */
	snapToPixel: function () {
		this.x += 0.5 - (this.x - Math.floor(this.x));
		this.y += 0.5 - (this.y - Math.floor(this.y));
		return this;
	},
	/** @returns {Point} */
	reverse: function () {
		this.x *= -1;
		this.y *= -1;
		return this;
	},
	/** @returns {Point} */
	clone : function () {
		return new this.constructor(this);
	},
	/** @returns {string} */
	dump: function () {
		return '[Point(' + this.x + ', ' + this.y + ')]';
	}
});

/** @private */
Point.from = function (object) {
	if (object == null) return null;

	return object instanceof Point ? object : new Point(object);
};

Point.shifts = atom.object.map({
	top    : [ 0, -1],
	right  : [ 1,  0],
	bottom : [ 0,  1],
	left   : [-1,  0],
	t      : [ 0, -1],
	r      : [ 1,  0],
	b      : [ 0,  1],
	l      : [-1,  0],
	tl     : [-1, -1],
	tr     : [ 1, -1],
	bl     : [-1,  1],
	br     : [ 1,  1]
}, Point);