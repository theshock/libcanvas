/*
---

name: "Point3D"

description: "A X/Y/Z point coordinates encapsulating class"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Geometry

provides: Point3D

...
*/

/** @class Point3D */
var Point3D = LibCanvas.declare( 'LibCanvas.Point3D', 'Point3D', Geometry, {
	x: 0,
	y: 0,
	z: 0,

	/** @private */
	coordinatesArray: ['x', 'y', 'z'],

	/**
	 * @constructs
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 * @returns {Point3D}
	 */
	set: function (x, y, z) {
		if ( arguments.length > 1 ) {
			this.x = Number(x) || 0;
			this.y = Number(y) || 0;
			this.z = Number(z) || 0;
		} else if ( x && typeof x.x  === 'number' ) {
			this.set( x.x, x.y, x.z );
		} else if ( x && typeof x[0] === 'number' ) {
			this.set( x[0], x[1], x[2] );
		} else {
			throw new Error( 'Wrong arguments in Isometric.Point3D' );
		}
		return this;
	},

	/**
	 * You can pass callback (function( value, axis, point ){})
	 * @param {function} fn
	 * @param {object} [context=null]
	 * @returns {Point3D}
	 */
	map: function (fn, context) {
		var point = this;
		point.coordinatesArray.forEach(function (axis) {
			point[axis] = fn.call( context || point, point[axis], axis, point );
		});
		return this;
	},

	/**
	 * @param {Number} factor
	 * @returns {Point3D}
	 */
	add: function (factor) {
		return this.map(function (c) { return c+factor });
	},

	/**
	 * @param {Number} factor
	 * @returns {Point3D}
	 */
	mul: function (factor) {
		return this.map(function (c) { return c*factor });
	},

	/**
	 * @param {Point3D} point3d
	 * @returns {Point3D}
	 */
	diff: function (point3d) {
		point3d = this.cast( point3d );
		return new this.constructor(
			point3d.x - this.x,
			point3d.y - this.y,
			point3d.z - this.z
		);
	},

	/**
	 * @param {Point3D} point3d
	 * @returns {Point3D}
	 */
	move: function (point3d) {
		point3d = this.cast( arguments );
		this.x += point3d.x;
		this.y += point3d.y;
		this.z += point3d.z;
		return this;
	},

	/**
	 * @param {Point3D} point3d
	 * @param {Number} accuracy
	 * @returns {boolean}
	 */
	equals: function (point3d, accuracy) {
		return point3d.x.equals( this.x, accuracy ) &&
		       point3d.y.equals( this.y, accuracy ) &&
		       point3d.z.equals( this.z, accuracy );
	},

	/** @returns {Point3D} */
	clone: function () {
		return new this.constructor( this );
	},

	/** @returns Array */
	toArray: function () {
		return [this.x, this.y, this.z];
	},

	/** @returns String */
	dump: function () {
		return '[LibCanvas.Point3D(' + this.toArray() + ')]';
	}
});