/*
---
description: Provides circle as a canvas object

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Shape

provides: [LibCanvas.Shapes.Circle]
*/

new function () {

var Point = LibCanvas.Point;
	
LibCanvas.namespace('Shapes').Circle = atom.Class({
	Extends: LibCanvas.Shape,
	set : function () {
		var a = Array.pickFrom(arguments);

		if (a.length >= 3) {
			this.center = new Point(a[0], a[1]);
			this.radius = a[2];
		} else if (a.length == 2) {
			this.center = Point.from(a[0]);
			this.radius = a[1];
		} else {
			a = a[0];
			this.radius = [a.r, a.radius].pick();
			if ('x' in a && 'y' in a) {
				this.center = new Point(a[0], a[1]);
			} else if ('center' in a) {
				this.center = Point.from(a.center);
			} else if ('from' in a) {
				this.center = new Point(a.from).move({
					x: this.radius,
					y: this.radius
				});
			}
		}
		if (!this.center) throw new TypeError('Wrong Arguments In Circle: Center is null');
		if (!Object.isReal(this.radius))
			throw new TypeError('Wrong Arguments In Circle: Radius is null');
	},
	getCoords : function () {
		return this.center;
	},
	hasPoint : function (point) {
		point = Point.from(arguments);
		return this.center.distanceTo(point) <= this.radius;
	},
	scale : function (factor) {
		this.center.scale(factor);
		return this;
	},
	intersect : function (obj) {
		if (obj instanceof this.self) {
			return this.center.distanceTo(obj.center) < this.radius + obj.radius;
		}
		return false;
	},
	move : function (distance) {
		this.center.move(distance);
		return this.parent(distance);
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		ctx.arc({
			circle : this,
			angle  : [0, (360).degree()]
		});
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	clone : function () {
		return new this.self(this.center.clone(), this.radius);
	},
	getPoints : function () {
		return { center : this.center };
	}
});

}();