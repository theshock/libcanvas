/*
---
description: A X/Y point coordinates encapsulating class

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Behaviors.Bindable

provides: [LibCanvas.Point]
*/

(function () {

var shifts = {
	top    : {x: 0, y:-1},
	right  : {x: 1, y: 0},
	bottom : {x: 0, y: 1},
	left   : {x:-1, y: 0},
	t      : {x: 0, y:-1},
	r      : {x: 1, y: 0},
	b      : {x: 0, y: 1},
	l      : {x:-1, y: 0},
	tl     : {x:-1, y:-1},
	tr     : {x: 1, y:-1},
	bl     : {x:-1, y: 1},
	br     : {x: 1, y: 1}
};

LibCanvas.Point = new Class({
	Implements: [LibCanvas.Behaviors.Bindable],
	initialize : function () {
		this.isNull = true;
		this.set.apply(this, arguments);
	},
	set : function (x, y) {
		if (!$chk(x)) {
			this.x = null;
			this.y = null;
			this.isNull = true;
		} else {
			if (arguments.length != 2) {
				if ($chk(x[0]) && $chk(x[1])) {
					y = x[1];
					x = x[0];
				} else if ($chk(x.x) && $chk(x.y)) {
					y = x.y;
					x = x.x;
				} else {
					throw 'Wrong Arguments In Point.Set';
				}
			}
			this.isNull = false;
			this.x = x * 1;
			this.y = y * 1;
		}
		return this;
	},
	move : function (distance, reverse) {
		var sign = function (num) {
			return num * (reverse ? -1 : 1);
		};
		var moved = {
			x : sign(distance.x),
			y : sign(distance.y)
		};
		this.set(
			this.x + moved.x,
			this.y + moved.y
		);
		this.bind('moved', [moved]);
		return this;
	},
	moveTo : function (newCoord, speed) {
		if (speed) {
			return this.animateMoveTo(newCoord, speed);
		} else {
			return this.move(this.diff(newCoord));
		}
	},
	angleTo : function (point) {
		var diff = this.diff(point);
		var angle = 0;

		if (diff.y == 0) {
			angle = diff.x > 0 ? (180).degree() : 0;
		} else if (diff.x == 0) {
			angle = diff.y > 0 ? (270).degree() : (90).degree();
		} else {
			angle = -Math.atan2(diff.x, diff.y) - (90).degree();
		}

		while (angle < 0) {
			angle += (360).degree();
		}
		return angle;
	},
	distanceTo : function (point) {
		var diff = this.diff(point);
		return Math.hypotenuse(diff.x, diff.y);
	},
	diff : function (point) {
		if (arguments.length > 1) {
			point = new LibCanvas.Point(arguments);
		}
		return !point ? {x:0,y:0} : {
			x : point.x - this.x,
			y : point.y - this.y
		};
	},
	rotate : function (angle, pivot, withCache) {
		pivot = pivot || {x : 0, y : 0};
		if (pivot.x == this.x && pivot.y == this.y) {
			return this;
		}
		var useCache = withCache && this.lastAngleCache;
		var radius   = pivot.distanceTo(this);

		var newAngle;
		if (useCache) {
			newAngle = this.lastAngleCache - angle;
		} else {
			var sides = pivot.diff(this);
			newAngle = Math.atan2(sides.x, sides.y) - angle;
		}
		if (withCache) {
			this.lastAngleCache = newAngle;
		}

		return this.moveTo({
			x : newAngle.sin() * radius + pivot.x,
			y : newAngle.cos() * radius + pivot.y
		});
	},
	scale : function (power, pivot) {
		pivot = pivot || {x : 0, y : 0};
		var diff = this.diff(pivot);
		return this.moveTo({
			x : pivot.x - diff.x  * (typeof power == 'object' ? power.x : power),
			y : pivot.y - diff.y  * (typeof power == 'object' ? power.y : power)
		});
	},
	alterPos : function (arg, fn) {
		return this.moveTo({
			x: fn(this.x, typeof arg == 'object' ? arg.x : arg),
			y: fn(this.y, typeof arg == 'object' ? arg.y : arg)
		});
	},
	mul : function (arg) {
		return this.alterPos(arg, function(a, b) {
			return a * b;
		});
	},
	getNeighbour : function (dir) {
		var to = this.clone();
		var s  = shifts[dir];
		to.x += s.x;
		to.y += s.y;
		return to;
	},
	animateMoveTo : function (to, speed) {
		$clear(this.movingInterval);
		this.movingInterval = function () {
			var move = {}, pixelsPerFn = speed / 20;
			var diff = this.diff(to);
			var dist = this.distanceTo(to);
			if (dist > pixelsPerFn) {
				move.x = diff.x * (pixelsPerFn / dist);
				move.y = diff.y * (pixelsPerFn / dist);
			} else {
				move.x = diff.x;
				move.y = diff.y;
				$clear(this.movingInterval);
				this.bind('stopMove');
			}
			this.move(move);
		}.bind(this).periodical(20);
		return this;
	},
	equals : function (to) {
		return to.x == this.x && to.y == this.y;
	},
	clone : function () {
		return new LibCanvas.Point(this);
	}
});

})();