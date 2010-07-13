
LibCanvas.Point = new Class({
	initialize : function () {
		this.isNull = true;
		this.set.apply(this, arguments);
	},
	set : function (x, y) {
		if (x == null) {
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
	move : function (distance) {
		this.x += distance.x;
		this.y += distance.y;
		this[0] = this.x * 1;
		this[1] = this.y * 1;
		return this;
	},
	diff : function (point) {
		if (arguments.length > 1) {
			point = new LibCanvas.Point();
			point.set.apply(point, arguments);
		}
		return {
			x : point.x - this.x,
			y : point.y - this.y
		};
	}
});