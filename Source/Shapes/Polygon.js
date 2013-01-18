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
	initialize: function method () {
		this.points = [];
		this._lines = [];
		method.previous.apply(this, arguments);
	},
	set : function (poly) {
		this.points.length = 0;

		var source = Array.isArray(poly) ? poly : atom.core.toArray(arguments);

		atom.array.append( this.points,
			source
				.filter(Boolean)
				.map(Point)
		);

		this._lines.length = 0;

		return this;
	},
	get length () {
		return this.points.length;
	},
	get lines () {
		var
			lines = this._lines,
			p = this.points,
			l = p.length,
			i = 0;

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
	getCoords : function () {
		return this.points[0];
	},
	processPath : function (ctx, noWrap) {
		var p = this.points, i = 0, l = p.length;

		if (!noWrap) ctx.beginPath();
		for (; i <= l; i++) {
			if (i == 0) {
				ctx.moveTo(p[i]);
			} else {
				ctx.lineTo(p[i == l ? 0 : i]);
			}
		}
		if (!noWrap) ctx.closePath();

		return ctx;
	},

	grow: function () { return this; },

	getBoundingRectangle: function () {
		var p = this.points, l = p.length, from, to;

		if (l == 0) {
			throw new Error('Shape is empty');
		}

		while (l--) {

			if (from) {
				from.x = Math.min( from.x, p[l].x );
				from.y = Math.min( from.y, p[l].y );
				  to.x = Math.max(   to.x, p[l].x );
				  to.y = Math.max(   to.y, p[l].y );
			} else {
				from = p[l].clone();
				to   = p[l].clone();
			}

		}

		return new Rectangle( from, to );
	},

	// points invoking
	move : function (distance, reverse) {
		return this.invoke('move', distance, reverse)
	},
	rotate : function (angle, pivot) {
		return this.invoke('rotate', angle, pivot)
	},
	scale : function (power, pivot) {
		return this.invoke('scale', power, pivot)
	},
	invoke: function (method, args) {
		args = Array.prototype.slice.call(arguments, 1);

		this.points.map(function (point) {
			point[method].apply(point, args);
		});
		return this;
	},
	forEach : function (fn) {
		this.points.forEach(fn);
		return this;
	},
	each: function (fn, context) {
		return this.forEach(context ? fn.bind(context) : fn);
	},

	hasPoint : function (point) {
		point = Point.from(point);

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
	getPoints : function () {
		return atom.array.toHash(this.points);
	},
	clone: function () {
		return new this.constructor( atom.array.invoke(this.points, 'clone') );
	}
});