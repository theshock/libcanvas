/*
---

name: "LibCanvas.Shapes.Polygon"

description: "Provides user-defined concave polygon as canvas object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
- "Shock <shocksilien@gmail.com>"

requires:
- LibCanvas
- LibCanvas.Point
- LibCanvas.Shape

provides: LibCanvas.Shapes.Polygon

...
*/
(function (){


var linesIntersect = function (a,b,c,d) {
	var x,y;
	if (d.x == c.x) { // DC == vertical line
		if (b.x == a.x) {
			return a.x == d.x && (a.y.between(c.y, d.y) || b.x.between(c.y, d.y));
		}
		x = d.x;
		y = b.y + (x-b.x)*(a.y-b.y)/(a.x-b.x);
	} else {
		x = ((a.x*b.y - b.x*a.y)*(d.x-c.x)-(c.x*d.y - d.x*c.y)*(b.x-a.x))/((a.y-b.y)*(d.x-c.x)-(c.y-d.y)*(b.x-a.x));
		y = ((c.y-d.y)*x-(c.x*d.y-d.x*c.y))/(d.x-c.x);
		x *= -1;
	}
	return (x.between(a.x, b.x, 'LR') || x.between(b.x, a.x, 'LR'))
		&& (y.between(a.y, b.y, 'LR') || y.between(b.y, a.y, 'LR'))
		&& (x.between(c.x, d.x, 'LR') || x.between(d.x, c.x, 'LR'))
		&& (y.between(c.y, d.y, 'LR') || y.between(d.y, c.y, 'LR'));
};

var Point = LibCanvas.Point;

LibCanvas.namespace('Shapes').Polygon = atom.Class({
	Extends: LibCanvas.Shape,
	points: [],
	set : function () {
		this.points.empty()
			.append(
				Array.pickFrom(arguments)
					.map(function (elem) {
						if (elem) return Point.from(elem);
					})
					.clean()
			);
		return this;
	},
	get length () {
		return this.points.length;
	},
	get: function (index) {
		return this.points[index];
	},
	hasPoint : function (point) {
		point = Point.from(Array.pickFrom(arguments));

		var result = false, points = this.points;
		for (var i = 0, l = this.length; i < l; i++) {
			var k = (i || l) - 1, I = points[i], K = points[k];
			if (
				(point.y.between(I.y , K.y, "L") || point.y.between(K.y , I.y, "L"))
					&&
				 point.x < (K.x - I.x) * (point.y -I.y) / (K.y - I.y) + I.x
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
		this.points.invoke('move', arguments);
		return this.parent.apply(this, arguments);
	},
	rotate : function (angle, pivot) {
		this.points.invoke('rotate', arguments);
		return this;
	},
	scale : function (x, y) {
		this.points.invoke('scale', arguments);
		return this;
	},
	intersect : function (poly) {
		var pp = poly.points, tp = this.points, ppL = pp.length, tpL = tp.length;
		for (var i = 0; i < ppL; i++) for (var k = 0; k < tpL; k++) {
			var a = tp[k],
				b = tp[k+1 == tpL ? 0 : k+1],
				c = pp[i],
				d = pp[i+1 == ppL ? 0 : i+1];
			if (linesIntersect(a,b,c,d)) return true;
		}
		return false;
	},
	each : function (fn, context) {
		return this.points.forEach(context ? fn.context(context) : fn);
	},

	getPoints : function () {
		return Array.toHash(this.points);
	}
});

})();