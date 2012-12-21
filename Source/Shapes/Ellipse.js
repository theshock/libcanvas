/*
---

name: "Shapes.Ellipse"

description: "Provides ellipse as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shapes.Rectangle

provides: Shapes.Ellipse

...
*/

/** @class Ellipse */
var Ellipse = LibCanvas.declare( 'LibCanvas.Shapes.Ellipse', 'Ellipse', Rectangle, {
	set: function () {
		this.bindMethods( 'update' );
		Rectangle.prototype.set.apply(this, arguments);
	},
	_angle : 0,
	get angle () {
		return this._angle;
	},
	set angle (a) {
		if (this._angle == a) return;
		this._angle = atom.math.normalizeAngle(a);
		this.updateCache = true;
	},
	update: function () {
		this.updateCache = true;
	},
	rotate : function (degree) {
		this.angle += degree;
		return this;
	},
	hasPoint : function () {
		var ctx = this.processPath( shapeTestBuffer().ctx );
		return ctx.isPointInPath(Point(arguments));
	},
	cache : null,
	updateCache : true,
	countCache : function () {
		if (this.cache && !this.updateCache) {
			return this.cache;
		}

		if (this.cache === null) {
			this.cache = [];
			for (var i = 12; i--;) this.cache.push(new Point());
		}
		var c = this.cache,
			angle = this._angle,
			kappa = .5522848,
			x  = this.from.x,
			y  = this.from.y,
			xe = this.to.x,
			ye = this.to.y,
			xm = (xe + x) / 2,
			ym = (ye + y) / 2,
			ox = (xe - x) / 2 * kappa,
			oy = (ye - y) / 2 * kappa;
		c[0].set(x, ym - oy); c[ 1].set(xm - ox, y); c[ 2].set(xm, y);
		c[3].set(xm + ox, y); c[ 4].set(xe, ym -oy); c[ 5].set(xe, ym);
		c[6].set(xe, ym +oy); c[ 7].set(xm +ox, ye); c[ 8].set(xm, ye);
		c[9].set(xm -ox, ye); c[10].set(x, ym + oy); c[11].set(x, ym);

		if (angle) {
			var center = new Point(xm, ym);
			for (i = c.length; i--;) c[i].rotate(angle, center);
		}

		return c;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		var c = this.countCache();
		ctx.beginPath(c[11])
		   .bezierCurveTo(c[0], c[1], c[2])
		   .bezierCurveTo(c[3], c[4], c[5])
		   .bezierCurveTo(c[6], c[7], c[8])
		   .bezierCurveTo(c[9], c[10],c[11]);
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	equals : function (shape, accuracy) {
		return Rectangle.prototype.equals.call( this, shape, accuracy ) && shape.angle == this.angle;
	},
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	},
	dump: function (name) {
		return Rectangle.prototype.dump.call(this, name || 'Ellipse');
	}
});