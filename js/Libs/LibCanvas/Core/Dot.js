
LibCanvas.Dot = new Class({
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
			if (arguments.length == 2) {
				this.x = x;
				this.y = y;
			} else if ($chk(x[0]) && $chk(x[1])) {
				this.x = x[0];
				this.y = x[1];
			} else if ($chk(x.x) && $chk(x.y)) {
				this.x = x.x;
				this.y = x.y;
			} else {
				throw 'Wrong Arguments In Dot.Set';
			}
			this.isNull = false;
		}
		this[0] = this.x;
		this[1] = this.y;
		this.length = 2;
		return this;
	}
});