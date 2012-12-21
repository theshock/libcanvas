/*
---

name: "Shapes.Polygon"

description: "Provides user-defined concave polygon as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape
	- Shapes.Line

provides: Shapes.Polygon

...
*/

/** @class Polygon */
var Polygon = LibCanvas.declare( 'LibCanvas.Shapes.Polygon', 'Polygon', Shape, {
	initialize: function () {
		this.points = [];
		this._lines = [];
		Shape.prototype.initialize.apply(this, arguments);
	},
	set : function (poly) {
		this.points.length = 0;
		atom.array.append( this.points,
			atom.array.clean(
				atom.array
					.pickFrom(arguments)
					.map(function (elem) { if (elem) return Point(elem) })
			)
		);
		this._lines.length = 0;
		return this;
	},
	get length () {
		return this.points.length;
	},
	get lines () {
		var lines = this._lines, p = this.points, l = p.length, i = 0;
		if (lines.length != l) for (;i < l; i++) {
			lines.push( new Line( p[i], i+1 == l ? p[0] : p[i+1] ) );
		}
		return this._lines;
	},
	get center () {
		return new Point().mean(this.points);
	},
	get: function (index) {
		return this.points[index];
	},
	hasPoint : function (point) {
		point = Point(atom.array.pickFrom(arguments));

		var result = false, points = this.points;
		for (var i = 0, l = this.length; i < l; i++) {
			var k = (i || l) - 1, I = points[i], K = points[k];
			if (
				(atom.number.between(point.y, I.y , K.y, "L")
				|| atom.number.between(point.y, K.y , I.y, "L")
				) && point.x < (K.x - I.x) * (point.y -I.y) / (K.y - I.y) + I.x
			) {
				result = !result;
			}
		}
		return result;
	},
	getCoords : function () {
		return this.points[0];
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		for (var i = 0, l = this.points.length; i < l; i++) {
			var point = this.points[i];
			ctx[i > 0 ? 'lineTo' : 'moveTo'](point.x, point.y);
		}
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	move : function (distance, reverse) {
		atom.array.invoke( this.points, 'move', distance, reverse);
		return this;
	},
	grow: function () {
		return this;
	},
	getBoundingRectangle: function () {
		var p = this.points, from, to;
		if (p.length == 0) throw new Error('Polygon is empty');

		from = p[0].clone(), to = p[0].clone();
		for (var l = p.length; l--;) {
			from.x = Math.min( from.x, p[l].x );
			from.y = Math.min( from.y, p[l].y );
			  to.x = Math.max(   to.x, p[l].x );
			  to.y = Math.max(   to.y, p[l].y );
		}
		return new Rectangle( from, to );
	},
	rotate : function (angle, pivot) {
		atom.array.invoke( this.points, 'rotate', angle, pivot );
		return this;
	},
	scale : function (power, pivot) {
		atom.array.invoke( this.points, 'scale', power, pivot );
		return this;
	},
	// #todo: cache
	intersect : function (poly) {
		if (poly.constructor != this.constructor) {
			return this.getBoundingRectangle().intersect( poly );
		}
		var tL = this.lines, pL = poly.lines, i = tL.length, k = pL.length;
		while (i-- > 0) for (k = pL.length; k-- > 0;) {
			if (tL[i].intersect(pL[k])) return true;
		}
		return false;
	},
	each : function (fn, context) {
		return this.points.forEach(context ? fn.bind(context) : fn);
	},

	getPoints : function () {
		return atom.array.toHash(this.points);
	},
	clone: function () {
		return new this.constructor( atom.array.invoke(this.points, 'clone') );
	}
});