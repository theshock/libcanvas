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


new function () {

var Point = LibCanvas.Point;
var min = Math.min, max = Math.max, isReal = Object.isReal;

LibCanvas.namespace('Shapes').Rectangle = atom.Class({
	Extends: LibCanvas.Shape,
	set : function () {
		var a = Array.pickFrom(arguments);

		if (a.length == 4) {
			this.from = new Point(a[0], a[1]);
			this.to   = this.from.clone().move({x:a[2], y:a[3]});
		} else if (a.length == 2) {
			this.from = Point.from(a[0]);
			this.to   = Point.from(a[1]);
		} else {
			a = a[0];
			if (a.from) {
				this.from = Point.from(a.from);
			} else if ('x' in a && 'y' in a) {
				this.from = new Point(a.x, a.y);
			}
			if (a.to) this.to = Point.from(a.to);
		
			if (!a.from || !a.to) {
				var as = a.size, size = {
					x : (as ? [as.w, as[0], as.width ] : [ a.w, a.width  ]).pick(),
					y : (as ? [as.h, as[1], as.height] : [ a.h, a.height ]).pick()
				};
				this.from ?
					(this.to = this.from.clone().move(size, 0)) :
					(this.from = this.to.clone().move(size, 1));
			}
		
		}
		return this;
	},

	getWidth : function () {
		return this.to.x - this.from.x;
	},
	getHeight : function () {
		return this.to.y - this.from.y;
	},
	setWidth : function (width) {
		this.to.moveTo({ x : this.from.x + width, y : this.to.y });
		return this;
	},
	setHeight : function (height) {
		this.to.moveTo({ x : this.to.x, y : this.from.y + height });
		return this;
	},
	hasPoint : function (point) {
		point = Point.from(arguments);
		return point.x != null && point.y != null
			&& point.x.between(min(this.from.x, this.to.x), max(this.from.x, this.to.x), 1)
			&& point.y.between(min(this.from.y, this.to.y), max(this.from.y, this.to.y), 1);
	},
	draw : function (ctx, type) {
		// fixed Opera bug - cant drawing rectangle with width or height below zero
		ctx.original(type + 'Rect', [
			min(this.from.x, this.to.x),
			min(this.from.y, this.to.y),
			this.getWidth() .abs(),
			this.getHeight().abs()
		]);
		return this;
	},
	getCenter : function () {
		return new Point(
			(this.from.x + this.to.x) / 2,
			(this.from.y + this.to.y) / 2
		);
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		ctx
			.moveTo(this.from.x, this.from.y)
			.lineTo(this.to.x, this.from.y)
			.lineTo(this.to.x, this.to.y)
			.lineTo(this.from.x, this.to.y)
			.lineTo(this.from.x, this.from.y);
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	getRandomPoint : function (margin) {
		margin = margin || 0;
		return new Point(
			Number.random(margin, this.getWidth()  - margin),
			Number.random(margin, this.getHeight() - margin)
		);
	},
	translate : function (point, fromRect) {
		var diff = fromRect.from.diff(point);
		return new Point({
			x : (diff.x / fromRect.getWidth() ) * this.getWidth(),
			y : (diff.y / fromRect.getHeight()) * this.getHeight()
		});
	}
});

}();