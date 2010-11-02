/*
---
description: Provides rectangle as canvas object

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Shape

provides: [LibCanvas.Shapes.Rectangle]
*/


LibCanvas.Shapes.Ellipse = new Class({
	Extends : LibCanvas.Shapes.Rectangle,
	set : function () {
		this.parent.apply(this, arguments);
		var update = function () {
			this.updateCache = true;
		}.bind(this);
		this.from.bind('move', update);
		this. to .bind('move', update);
	},
	rotateAngle : 0,
	rotate : function (degree) {
		this.rotateAngle = (this.rotateAngle + degree)
			.normalizeAngle();
		this.updateCache = true;
		return this;
	},
	getBufferCtx : function () {
		if (!this.bufferCtx) {
			this.bufferCtx = LibCanvas
				.Buffer(1, 1)
				.getContext('2d-libcanvas');
		}
		return this.bufferCtx;
	},
	hasPoint : function () {
		var ctx = this.getBufferCtx();
		this.processPath(ctx);
		var has= ctx.isPointInPath(
			this.checkPoint(arguments)
		);
		return has;
	},
	getCoords : function () {
		return this.from;
	},
	cache : null,
	updateCache : true,
	countCache : function () {
		if (this.cache && !this.updateCache) {
			return this.cache;
		}

		var Point = LibCanvas.Point;
		if (this.cache === null) {
			this.cache = [];
			for (var i = 12; i--;) {
				this.cache.push(new Point());
			}
		}
		var c = this.cache;
		var kappa = .5522848;
		var x  = this.from.x;
		var y  = this.from.y;
		var xe = this.to.x;
		var ye = this.to.y;
		var xm = (xe + x) / 2;
		var ym = (ye + y) / 2;
		var ox = (xe - x) / 2 * kappa;
		var oy = (ye - y) / 2 * kappa;
		c[0].set(x, ym - oy); c[ 1].set(xm - ox, y); c[ 2].set(xm, y);
		c[3].set(xm + ox, y); c[ 4].set(xe, ym -oy); c[ 5].set(xe, ym);
		c[6].set(xe, ym +oy); c[ 7].set(xm +ox, ye); c[ 8].set(xm, ye);
		c[9].set(xm -ox, ye); c[10].set(x, ym + oy); c[11].set(x, ym);

		var angle = this.rotateAngle;
		if (angle) {
			var center = new Point(xm, ym);
			c.each(function (point) {
				point.rotate(angle, center);
			});
		}

		return c;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) {
			ctx.beginPath();
		}

		var c = this.countCache();
		ctx.beginPath(c[11])
		   .bezierCurveTo(c[0], c[1], c[2])
		   .bezierCurveTo(c[3], c[4], c[5])
		   .bezierCurveTo(c[6], c[7], c[8])
		   .bezierCurveTo(c[9], c[10],c[11]);
		if (!noWrap) {
			ctx.closePath();
		}
		return ctx;
	},
	equals : function (ellipse) {
		return ellipse.from.equals(this.from) && ellipse.to.equals(this.to);
	},
	clone : function () {
		return new LibCanvas.Shapes.Ellipse(
			this.from.clone(), this.to.clone()
		);
	},
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	}
});