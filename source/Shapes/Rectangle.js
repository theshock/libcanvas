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

LibCanvas.Shapes.Rectangle = new Class({
	Extends : LibCanvas.Shape,
	set : function () {
		var a = $A(arguments);
		if ($type(a[0]) == 'array') {
			a = a[0];
		}
		this.size = {};
		this.from = {};
		this.to   = {};
		if ($chk(a[0]) && [a[0].size, a[0].from, a[0].to, a[0].fromX, a[0].width, a[0].w, a[0].x].firstReal() !== null ) {
			a[0].size = a[0].size || {};
			this.size.w = [ a[0].w, a[0].width,  a[0].size.w, a[0].size[0] ].firstReal();
			this.size.h = [ a[0].h, a[0].height, a[0].size.h, a[0].size[1] ].firstReal();
			a[0].from = a[0].from || {};
			this.from.x = [ a[0].x, a[0].fromX, a[0].from.x, a[0].from[0] ].firstReal();
			this.from.y = [ a[0].y, a[0].fromY, a[0].from.y, a[0].from[1] ].firstReal();
			a[0].to   = a[0].to   || {};
			this.to.x   = [ a[0].toX, a[0].to.x, a[0].to[0] ].firstReal();
			this.to.y   = [ a[0].toY, a[0].to.y, a[0].to[1] ].firstReal();
		} else {
			if ($type(a[0]) == 4) {
				a = a[0];
			}
			if (a.length == 4) {
				this.from.x = a[0];
				this.from.y = a[1];
				this.size.w = a[2];
				this.size.h = a[3];
				this.to.x   = null;
				this.to.y   = null;
			}
		}

		if (!this.countElse()) {
			throw 'WrongArgumentsCount in Rectangle'
		}

		this.from = new LibCanvas.Point(this.from);
		this.to   = new LibCanvas.Point(this.to);

		return this;
	},
	countElse : function () {
		var funcs = ['width', 'height', 'fromX', 'fromY', 'toX', 'toY'];
		for (var i = 0; i < funcs.length; i++) {
			if (!this.countElseFuncs[funcs[i]].call(this)) {
				return false;
			}
		}
		this.width  = this.size.w;
		this.height = this.size.h;
		this.x      = this.from.x;
		this.y      = this.from.y;
		this[0] = this.from.x;
		this[1] = this.from.y;
		this[2] = this.size.w;
		this[3] = this.size.h;
		this.length = 4;

		return true;
	},
	countElseFuncs : {
		width : function () {
			if (this.size.w === null) {
				if (this.from.x !== null && this.to.x !== null) {
					this.size.w = this.to.x - this.from.x;
				} else {
					return false;
				}
			}
			return true;
		},
		height : function () {
			if (this.size.h === null) {
				if (this.from.y !== null && this.to.y !== null) {
					this.size.h = this.to.y - this.from.y;
				} else {
					return false;
				}
			}
			return true;
		},
		fromX : function () {
			if (this.from.x === null) {
				if (this.size.w !== null && this.to.x !== null) {
					this.from.x = this.to.x - this.size.w;
				} else {
					return false;
				}
			}
			return true;
		},
		fromY : function () {
			if (this.from.y === null) {
				if (this.size.h !== null && this.to.y !== null) {
					this.from.y = this.to.y - this.size.w;
				} else {
					return false;
				}
			}
			return true;
		},
		toX : function () {
			if (this.to.x === null) {
				if (this.size.w !== null && this.from.x !== null) {
					this.to.x = this.from.x + this.size.w;
				} else {
					return false;
				}
			}
			return true;
		},
		toY : function () {
			if (this.to.y === null) {
				if (this.size.h !== null && this.from.y !== null) {
					this.to.y = this.from.y + this.size.h;
				} else {
					return false;
				}
			}
			return true;
		}
	},
	hasPoint : function (point) {
		point = this.checkPoint(arguments);
		return $chk(point.x) && $chk(point.y)
			&& point.x.between(this.from.x, this.to.x, 1)
			&& point.y.between(this.from.y, this.to.y, 1);
	},
	move : function (distance) {
		this.from.x += distance.x;
		this.from.y += distance.y;
		this.to.x   += distance.x;
		this.to.y   += distance.y;
		this.x      += distance.x;
		this.y      += distance.y;
		return this.parent(distance);
	},
	draw : function (ctx, type) {
		ctx.original(type + 'Rect', 
			[this.from.x, this.from.y, this.size.w, this.size.h]
		);
		return this;
	},
	getCoords : function () {
		return this.from;
	},
	getCenter : function () {
		return new LibCanvas.Point(
			this.from.x + this.width  / 2,
			this.from.y + this.height / 2
		);
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) {
			ctx.beginPath();
		}
		ctx
			.moveTo(this.from.x, this.from.y)
			.lineTo(this.to.x, this.from.y)
			.lineTo(this.to.x, this.to.y)
			.lineTo(this.from.x, this.to.y)
			.lineTo(this.from.x, this.from.y);
		if (!noWrap) {
			ctx.closePath();
		}
		return ctx;
	},
	getRandomPoint : function () {
		return new LibCanvas.Point(
			$random(0, this.width),
			$random(0, this.height)
		);
	}
});