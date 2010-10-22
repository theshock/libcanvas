LibCanvas.Utils.Translator = new Class({
	initialize : function (rectTo) {
		this.rectTo = rectTo;
	},
	shapes : [],
	add : function (shape) {
		shape.translated = shape.clone();
		this.shapes.include(shape);
		return shape.translated;
	},
	rm : function (shape) {
		delete shape.translated;
		this.shapes.erase(shape);
	},

	translate : function (rectFrom) {
		var rectTo = this.rectTo;
		this.shapes.each(function (shape) {
			var translate = function (trans, orig) {
				trans.moveTo(
					rectTo.translate(orig, rectFrom)
				);
			}

			if (shape instanceof LibCanvas.Point) {
				translate(shape.translated, shape);
			} else {
				var points = shape.getPoints();
				for (var i in points) {
					translate(shape.translated[i], points[i]);
				}
			}

		});
	}

});