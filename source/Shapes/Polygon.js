/*
---
description: Provides user-defined concave polygon as canvas object

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Shape

provides: [LibCanvas.Shapes.Polygon]
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



LibCanvas.Shapes.Polygon = new Class({
	Extends : LibCanvas.Shape,
	set : function () {
		var a = $A(arguments);
		if ($type(a[0][0]) == 'array' || a[0][0] instanceof LibCanvas.Point) {
			a = a[0]
		}
		var polygon = this;
		a.each(function (elem, index) {
			polygon[index] = elem instanceof LibCanvas.Point ?
				elem : new LibCanvas.Point(elem);
		});
		this.length = a.length;
		return this;
	},
	hasPoint : function (point) {
		point = this.checkPoint(arguments);

		var polygon = this;
		var result = false;
		polygon.length.times(function (i) {
			var k = i ? i - 1 : polygon.length - 1;
			var I = polygon[i];
			var K = polygon[k];
			if (
				(point.y.between(I.y , K.y, "L") || point.y.between(K.y , I.y, "L"))
					&&
				 point.x < (K.x - I.x) * (point.y -I.y) / (K.y - I.y) + I.x
			) {
				result = !result;
			}
		});
		return result;
	},
	getCoords : function () {
		return this[0];
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) {
			ctx.beginPath();
		}
		this.each(function (point, i) {
			ctx[i > 0 ? 'lineTo' : 'moveTo'](point.x, point.y);
		});
		if (!noWrap) {
			ctx.closePath();
		}
		return ctx;
	},
	move : function (distance) {
		this.each(function (point) {
			point.move(distance);
		});
		return this.parent(distance);
	},
	rotate : function (angle, pivot, withCache) {
		this.each(function (point) {
			point.rotate(angle, pivot, withCache);
		});
		return this;
	},
	scale : function (x, y) {
		this.each(function (point) {
			point.scale(x, y);
		});
		return this;
	},
	intersect : function (poly) {
		for (var i = 0; i < poly.length; i++) {
			for (var k = 0; k < this.length; k++) {
				var a = this[k];
				var b = this[k+1 == this.length ? 0 : k+1];
				var c = poly[i];
				var d = poly[i+1 == poly.length ? 0 : i+1];
				if (linesIntersect(a,b,c,d)) {
					return true;
				}
			}
		}
		return false;
	},
	each : Array.prototype.each
});

})();