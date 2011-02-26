/*
---

name: "Shapes.Line"

description: "Provides line as canvas object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Line

...
*/

new function () {

var Point = LibCanvas.Point,
	math = Math,
	max = math.max,
	min = math.min,
	between = function (x, a, b) {
		return x === a || x === b || (a < x && x < b) || (b < x && x < a);
	};


LibCanvas.namespace('Shapes').Line = atom.Class({
	Extends: LibCanvas.Shape,
	set : function (from, to) {
		var a = Array.pickFrom(arguments);

		this.from = Point.from(a[0] || a.from);
		this.to   = Point.from(a[1] || a.to);
		
		return this;
	},
	hasPoint : function (point) {
		var fx = this.from.x,
			fy = this.from.y,
			tx = this.to.x,
			ty = this.to.y,
			px = this.point.x,
			py = this.point.y;

		if (!( px.between(min(fx, tx), max(fx, tx))
		    && py.between(min(fy, ty), max(fy, ty))
		)) return false;

		// if triangle square is zero - points are on one line
		return ((fx-px)*(ty-py)-(tx-px)*(fy-py)).round(6) == 0;
	},
	intersect: function (line) {
		line = this.self.from(arguments);
		var a = this.from, b = this.to, c = line.from, d = line.t, x, y;
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
		
		return between(x, a.x, b.x) && between (y, a.y, b.y) &&
		       between(x, c.x, d.x) && between (y, c.y, d.y);
	},
	get length () {
		return this.to.distanceTo(this.from);
	},
	getLength : function () {
		return this.length;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		ctx.moveTo(this.from).lineTo(this.to);
		if (!noWrap) ctx.closePath();
		return ctx;
	}
});

}();
