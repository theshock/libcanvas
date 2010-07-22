
LibCanvas.Point = new Class({
	Implements: [LibCanvas.Interfaces.Bindable],
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
		this[0] = this.x * 1;
		this[1] = this.y * 1;
		this.length = 2;
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
	moveTo : function (newCoord) {
		return this.move(this.diff(newCoord));
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
		return (diff.x.pow(2) + diff.y.pow(2)).sqrt();
	},
	diff : function (point) {
		if (arguments.length > 1) {
			point = new LibCanvas.Point(arguments);
		}
		return {
			x : point.x - this.x,
			y : point.y - this.y
		};
	},
	rotate : function (angle, pivot, withCache) {
		pivot = pivot || { x : 0, y : 0 };
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
		pivot = pivot || { x : 0, y : 0 };
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
	}
});