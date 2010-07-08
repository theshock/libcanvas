

LibCanvas.Shapes.Polygon = new Class({
	Extends : LibCanvas.Shape,
	set : function () {
		var a = $A(arguments);
		if ($type(a[0][0]) == 'array' || a[0][0] instanceof LibCanvas.Shapes.Point) {
			a = a[0]
		}
		var polygon = this;
		a.each(function (elem, index) {
			polygon[index] = elem instanceof LibCanvas.Point ?
				elem : new LibCanvas.Point(elem);
		});
		this.length = a.length;
		return this;
	},
	hasPoint : function (point) {
		point = this.checkPoint(arguments);

		var polygon = this;
		var result = false;
		polygon.length.times(function (i) {
			var k = i ? i - 1 : polygon.length - 1;
			var I = polygon[i];
			var K = polygon[k];
			if (
				(point.y.between(I.y , K.y, "L") || point.y.between(K.y , I.y, "L"))
					&&
				 point.x < (K.x - I.x) * (point.y -I.y) / (K.y - I.y) + I.x
			) {
				result = !result;
			}
		});
		return result;
	},
	draw : function (ctx, type) {
		ctx.beginPath();
		this.each(function (point, i) {
			ctx[i > 0 ? 'lineTo' : 'moveTo'](point.x, point.y);
		});
		ctx.closePath();
		ctx[type]();
		return this;
	},
	move : function (distance) {
		this.each(function (point) {
			point.move(distance);
		});
	},
	each : Array.prototype.each
});
