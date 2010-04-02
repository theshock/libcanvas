

LibCanvas.Shapes.Polygon = new Class({
	Extends : LibCanvas.Shape,
	set : function () {
		var a = $A(arguments);
		if ($type(a[0][0]) == 'array' || a[0][0] instanceof LibCanvas.Shapes.Dot) {
			a = a[0]
		}
		var polygon = this;
		a.each(function (elem, index) {
			polygon[index] = elem instanceof LibCanvas.Dot ?
				elem : new LibCanvas.Dot(elem);
		});
		this.length = a.length;
		return this;
	},
	hasDot : function (dot) {
		dot = this.checkDot(arguments);

		var polygon = this;
		var result = false;
		polygon.length.times(function (i) {
			var k = i ? i - 1 : polygon.length - 1;
			var I = polygon[i];
			var K = polygon[k];
			if (
				(dot.y.between(I.y , K.y, "L") || dot.y.between(K.y , I.y, "L"))
					&&
				 dot.x < (K.x - I.x) * (dot.y -I.y) / (K.y - I.y) + I.x
			) {
				result = !result;
			}
		});
		return result;
	},
	draw : function (ctx, type) {
		ctx.beginPath();
		this.each(function (dot, i) {
			ctx[i > 0 ? 'lineTo' : 'moveTo'](dot.x, dot.y);
		});
		ctx.closePath();
		ctx[type]();
		return this;
	},
	each : Array.prototype.each
});
