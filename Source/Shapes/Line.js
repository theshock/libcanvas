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
	math  = Math,
	between = function (x, a, b) {
		return x === a || x === b || (a < x && x < b) || (b < x && x < a);
	};


LibCanvas.Shapes.Line = atom.Class({
	Extends: LibCanvas.Shape,
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

		if (!( point.x.between(math.min(fx, tx), math.max(fx, tx))
		    && point.y.between(math.min(fy, ty), math.max(fy, ty))
		)) return false;

		// if triangle square is zero - points are on one line
		return ((fx-px)*(ty-py)-(tx-px)*(fy-py)).round(6) == 0;
	},
	intersect: function (line, point) {
		line = this.self.from(line);
		var a = this.from, b = this.to, c = line.from, d = line.to, x, y, FALSE = point ? null : false;
		if (d.x == c.x) { // DC == vertical line
			if (b.x == a.x) {
				if (a.x == d.x) {
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
		
		return between(x, a.x, b.x) && between (y, a.y, b.y) &&
		       between(x, c.x, d.x) && between (y, c.y, d.y) ?
		            (point ? new Point(x, y) : true) : FALSE;
	},
	distanceTo: function (p, asInfiniteLine) {
		var f = this.from, t = this.t, degree, s, x, y;
		if (p instanceof Point) {
			
			if (!asInfiniteLine) {
				degree = math.atan2(p.x - t.x, p.y - t.y).getDegree();
				if ( degree.between(-90, 90) ) {
					return t.distanceTo( p );
				}

				degree = math.atan2(f.x - p.x, f.y - p.y).getDegree();
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
			return 2 * s / math.sqrt(x*x+y*y);
		}
		return null;
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

};
