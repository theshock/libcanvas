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

LibCanvas.Shapes.Circle = new Class({
	Extends : LibCanvas.Shape,
	set : function () {
		var a = $A(arguments);
		if (a[0] && !(a[0] instanceof LibCanvas.Point) &&
			(a[0].from || a[0].center || $chk(a[0].x) || $chk(a[0][0]))
		) {
			a = a[0];
		}

		if (a.from) {
			a.center = new LibCanvas.Point(a.from);
			a.center.x += [a.r, a.radius].firstReal();
			a.center.y += [a.r, a.radius].firstReal();
		}

		var setCenter = function () {
			if (!this.center) {
				this.center = new LibCanvas.Point;
			}
			this.center.set.apply(
				this.center, arguments
			);
		}.bind(this);

		if (a.length && a.length >= 3) {
			setCenter(a[0], a[1]);
			this.radius = a[2];
		} else if (a.length && a.length == 2) {
			(a[0] instanceof LibCanvas.Point) ?
				(this.center = a[0]) : setCenter(a[0]);
			this.radius = a[1];
		} else if (typeof a == 'object') {
			if ($chk(a.x) && $chk(a.y)) {
				setCenter(a.x, a.y);
			} else if (a.center instanceof LibCanvas.Point) {
				this.center = a.center;
			} else {
				setCenter(a.center);
			}
			this.radius = [a.r, a.radius].firstReal();
		} else {
			throw 'Wrong Arguments In Circle';
		}
	},
	getCoords : function () {
		return this.center;
	},
	hasPoint : function (point) {
		point = this.checkPoint(arguments);
		return this.center.distanceTo(point) <= this.radius;
			
	},
	scale : function (factor) {
		this.center.scale(factor);
		return this;
	},
	intersect : function (obj) {
		if (obj instanceof LibCanvas.Shapes.Circle) {
			return this.center.distanceTo(obj.center) < this.radius + obj.radius;
		}
		return false;
	},
	move : function (distance) {
		this.center.move(distance);
		return this.parent(distance);
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) {
			ctx.beginPath();
		}
		ctx.arc({
			circle : this,
			angle  : [0, (360).degree()]
		});
		if (!noWrap) {
			ctx.closePath();
		}
		return ctx;
	}
});
