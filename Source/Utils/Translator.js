/*
---

name: "Utils.Translator"

description: "Unstable: translate shapes (i.e. zoom)"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Shapes.Rectangle

provides: Utils.Translator

...
*/

new function () {

var Point = LibCanvas.Point;

LibCanvas.Utils.Translator = atom.Class({
	initialize : function (rectTo) {
		this.shapes = [];
		this.rectTo = rectTo;
	},
	add : function (shape) {
		shape.translated = shape.clone();
		this.shapes.include(shape);
		return shape.translated;
	},
	rm : function (shape) {
		delete shape.translated;
		this.shapes.erase(shape);
		return this;
	},

	translate : function (rectFrom) {
		var rectTo = this.rectTo;
		var translate = function (trans, orig) {
			trans.moveTo(rectTo.translate(orig, rectFrom));
		};
		this.shapes.forEach(function (shape) {
			if (shape instanceof Point) {
				translate(shape.translated, shape);
			} else {
				var points = shape.getPoints();
				for (var i in points) translate(shape.translated[i], points[i]);
			}
		});
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Utils.Translator]')

});

}();