

LibCanvas.Shapes.Circle = new Class({
	Extends : LibCanvas.Shape,
	set : function () {
		var a = $A(arguments);
		if (a[0] && (a[0].center || $chk(a[0].x) || $chk(a[0][0]))) {
			a = a[0];
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
	hasPoint : function (point) {
		point = this.checkPoint(arguments);
		// Растояние точки к центру круга меньше радиуса
		return (
			(point.x - this.center.x).pow(2) +
			(point.y - this.center.y).pow(2)
		).sqrt() <= this.radius;
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
