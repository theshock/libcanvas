

LibCanvas.Shapes.Circle = new Class({
	Extends : LibCanvas.Shape,
	set : function () {
		var a = $A(arguments);
		if (a[0] && (a[0].center || $chk(a[0].x) || $chk(a[0][0]))) {
			a = a[0];
		}

		if (a.length && a.length >= 3) {
			this.x = a[0];
			this.y = a[1];
			this.r = a[2];
		} else if (typeof a == 'object') {
			if ($chk(a.x) && $chk(a.y)) {
				this.x = a.x;
				this.y = a.y;
			} else {
				var dot = a.center instanceof LibCanvas.Dot ?
					a.center : new LibCanvas.Dot(a.center);
				this.x = dot.x;
				this.y = dot.y;
			}
				this.r = [a.r, a.radius].firstReal();
			} else {
			throw 'Wrong Arguments In Circle';
		}
		this.updateCenter();
		this.radius = this.r;
	},
	updateCenter : function () {
		if (!this.center) {
			this.center = new LibCanvas.Dot();
		}
		this.center.set(this.x, this.y);
	},
	hasDot : function (dot) {
		dot = this.checkDot(arguments);
		// Растояние точки к центру круга меньше радиуса
		return (
			(dot.x - this.x).pow(2) +
			(dot.y - this.y).pow(2)
		).sqrt() <= this.radius;
	},
	move : function (distance) {
		this.x += distance.x;
		this.y += distance.y;
		this.updateCenter();
		return this;
	},
	draw : function (ctx, type) {
		ctx.beginPath()
			.arc({
				circle : this,
				angle  : [0, (360).degree()]
			});
		ctx[type]();
		return this;
	}
});
