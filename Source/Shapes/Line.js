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

var Line = function () {

var between = function (x, a, b, accuracy) {
	return atom.number.equals(x, a, accuracy)
		|| atom.number.equals(x, b, accuracy)
		|| (a < x && x < b)
		|| (b < x && x < a);
};

var halfPi = Math.PI/2;

/** @class Line */
return LibCanvas.declare( 'LibCanvas.Shapes.Line', 'Line', Shape, {
	set : function (from, to) {
		var a = atom.array.pickFrom(arguments);

		if (a.length === 4) {
			this.from = new Point( a[0], a[1] );
			this.to   = new Point( a[2], a[3] );
		} else {
			this.from = Point.from(a[0] || a.from);
			this.to   = Point.from(a[1] || a.to);
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

		if (!( atom.number.between(point.x, Math.min(fx, tx), Math.max(fx, tx))
		    && atom.number.between(point.y, Math.min(fy, ty), Math.max(fy, ty))
		)) return false;

		// if triangle square is zero - points are on one line
		return atom.number.round(((fx-px)*(ty-py)-(tx-px)*(fy-py)), 6) == 0;
	},
	getBoundingRectangle: function () {
		return new Rectangle(this.from, this.to).fillToPixel().grow(2);
	},
	intersect: function (line, point, accuracy) {
		if (line.constructor != this.constructor) {
			return this.getBoundingRectangle().intersect( line );
		}
		var a = this.from, b = this.to, c = line.from, d = line.to, x, y, FALSE = point ? null : false;
		if (atom.number.equals(d.x, c.x, accuracy)) { // DC == vertical line
			if (atom.number.equals(b.x, a.x, accuracy)) {
				if (atom.number.equals(a.x, d.x, accuracy)) {
					if (atom.number.between(a.y, c.y, d.y)) {
						return a.clone();
					} else if (atom.number.between(b.y, c.y, d.y)) {
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
		var f = this.from, t = this.to, angle, s, x, y;

		if (!asInfiniteLine) {
			angle = Math.atan2(p.x - t.x, p.y - t.y);
			if ( atom.number.between(angle, -halfPi, halfPi) ) {
				return t.distanceTo( p );
			}

			angle = Math.atan2(f.x - p.x, f.y - p.y);
			if ( atom.number.between(angle, -halfPi, halfPi) ) {
				return f.distanceTo( p );
			}
		}

		s = Math.abs(
			f.x * (t.y - p.y) +
			t.x * (p.y - f.y) +
			p.x * (f.y - t.y)
		) / 2;

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
	draw : function (ctx, type) {
		ctx.beginPath();
		this.processPath(ctx, true)[type]();
		ctx.closePath();
		return this;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		ctx.moveTo(this.from).lineTo(this.to);
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	dump: function () {
		return Shape.prototype.dump.call(this, 'Line');
	}
});

}();
