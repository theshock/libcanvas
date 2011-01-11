/*
---

name: "LibCanvas.Shapes.Line"

description: "Provides line as canvas object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
- "Shock <shocksilien@gmail.com>"

requires:
- LibCanvas
- LibCanvas.Point
- LibCanvas.Shape

provides: LibCanvas.Shapes.Line

...
*/

new function () {

var Point = LibCanvas.Point,
	math = Math,
	max = math.max,
	min = math.min;


LibCanvas.namespace('Shapes').Line = atom.Class({
	Extends: LibCanvas.Shape,
	set : function (from, to) {
		var a = Array.pickFrom(arguments);

		this.from = Point.from(a[0] || a.from);
		this.to   = Point.from(a[1] || a.to);
		
		return this;
	},
	hasPoint : function (point) {
		var fx = this.from.x,
			fy = this.from.y,
			tx = this.to.x,
			ty = this.to.y,
			px = this.point.x,
			py = this.point.y;

		if (!( px.between(min(fx, tx), max(fx, tx))
		    && py.between(min(fy, ty), max(fy, ty))
		)) return false;

		// if triangle square is zero - points are on one line
		return ((fx-px)*(ty-py)-(tx-px)*(fy-py)).round(6) == 0;
	},
	getLength : function () {
		return this.to.distanceTo(this.from);
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		ctx.moveTo(this.from).lineTo(this.to);
		if (!noWrap) ctx.closePath();
		return ctx;
	}
});

}();
