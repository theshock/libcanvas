/*
---

name: "Shapes.Line"

description: "Provides line as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Line

...
*/

var Line = LibCanvas.Shapes.Line = function () {

var between = function (x, a, b, accuracy) {
	return x.equals(a, accuracy) || x.equals(b, accuracy) || (a < x && x < b) || (b < x && x < a);
};

return Class(
/** @lends {LibCanvas.Shapes.Line.prototype} */
{
	Extends: Shape,
	set : function (from, to) {
		var a = Array.pickFrom(arguments);

		if (a.length === 4) {
			this.from = new Point( a[0], a[1] );
			this.to   = new Point( a[2], a[3] );
		} else {
			this.from = Point(a[0] || a.from);
			this.to   = Point(a[1] || a.to);
		}

		return this;
	},
	hasPoint : function (point) {
		var fx = this.from.x,
			fy = this.from.y,
			tx = this.to.x,
			ty = this.to.y,
			px = point.x,
			py = point.y;

		if (!( point.x.between(Math.min(fx, tx), Math.max(fx, tx))
		    && point.y.between(Math.min(fy, ty), Math.max(fy, ty))
		)) return false;

		// if triangle square is zero - points are on one line
		return ((fx-px)*(ty-py)-(tx-px)*(fy-py)).round(6) == 0;
	},
	intersect: function (line, point, accuracy) {
		if (line.self != this.self) {
			return this.getBoundingRectangle().intersect( line );
		}
		var a = this.from, b = this.to, c = line.from, d = line.to, x, y, FALSE = point ? null : false;
		if (d.x.equals(c.x, accuracy)) { // DC == vertical line
			if (b.x.equals(a.x, accuracy)) {
				if (a.x.equals(d.x, accuracy)) {
					if (a.y.between(c.y, d.y)) {
						return a.clone();
					} else if (b.y.between(c.y, d.y)) {
						return b.clone();
					} else {
						return FALSE;
					}
				} else {
					return FALSE;
				}
			}
			x = d.x;
			y = b.y + (x-b.x)*(a.y-b.y)/(a.x-b.x);
		} else {
			x = ((a.x*b.y - b.x*a.y)*(d.x-c.x)-(c.x*d.y - d.x*c.y)*(b.x-a.x))/((a.y-b.y)*(d.x-c.x)-(c.y-d.y)*(b.x-a.x));
			y = ((c.y-d.y)*x-(c.x*d.y-d.x*c.y))/(d.x-c.x);
			x *= -1;
		}

		if (!between(x, a.x, b.x, accuracy)) return FALSE;
		if (!between(y, a.y, b.y, accuracy)) return FALSE;
		if (!between(x, c.x, d.x, accuracy)) return FALSE;
		if (!between(y, c.y, d.y, accuracy)) return FALSE;

		return point ? new Point(x, y) : true;
	},
	perpendicular: function (point) {
		point = Point( point );
		var
			fX = this.from.x,
			fY = this.from.y,
			tX = this.to.x,
			tY = this.to.y,
			pX = point.x,
			pY = point.y,
			dX = (tX-fX) * (tX-fX),
			dY = (tY-fY) * (tY-fY),
			rX = ((tX-fX)*(tY-fY)*(pY-fY)+fX*dY+pX*dX) / (dX+dY),
			rY = (tY-fY)*(rX-fX)/(tX-fX)+fY;

		return new Point( rX, rY );
	},
	distanceTo: function (p, asInfiniteLine) {
		p = Point(p);
		var f = this.from, t = this.to, degree, s, x, y;
			
		if (!asInfiniteLine) {
			degree = Math.atan2(p.x - t.x, p.y - t.y).getDegree();
			if ( degree.between(-90, 90) ) {
				return t.distanceTo( p );
			}

			degree = Math.atan2(f.x - p.x, f.y - p.y).getDegree();
			if ( degree.between(-90, 90) ) {
				return f.distanceTo( p );
			}
		}

		s = (
			f.x * (t.y - p.y) +
			t.x * (p.y - f.y) +
			p.x * (f.y - t.y)
		).abs() / 2;

		x = f.x - t.x;
		y = f.y - t.y;
		return 2 * s / Math.sqrt(x*x+y*y);
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
	},
	dump: function () {
		return this.parent('Line');
	},
	toString: Function.lambda('[object LibCanvas.Shapes.Line]')
});

}();
