/*
---

name: "Shapes.RoundedRectangle"

description: "Provides rounded rectangle as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Shapes.Rectangle

provides: Shapes.RoundedRectangle

...
*/

/** @class RoundedRectangle */
var RoundedRectangle = LibCanvas.declare(
	'LibCanvas.Shapes.RoundedRectangle', 'RoundedRectangle', Rectangle, {
		radius: 0,

		setRadius: function (value) {
			this.radius = value;
			return this;
		},
		draw : Shape.prototype.draw,
		processPath : function (ctx, noWrap) {
			var from = this.from, to = this.to, radius = this.radius;
			if (!noWrap) ctx.beginPath();
			ctx
				.moveTo (from.x, from.y+radius)
				.lineTo (from.x,   to.y-radius)
				.curveTo(from.x, to.y, from.x + radius, to.y)
				.lineTo (to.x-radius, to.y)
				.curveTo(to.x,to.y, to.x,to.y-radius)
				.lineTo (to.x, from.y+radius)
				.curveTo(to.x, from.y, to.x-radius, from.y)
				.lineTo (from.x+radius, from.y)
				.curveTo(from.x,from.y,from.x,from.y+radius);
			if (!noWrap) ctx.closePath();
			return ctx;
		},


		clone: function method () {
			return method.previous
				.apply(this, arguments)
				.setRadius(this.radius);
		},

		equals: function (shape, accuracy) {
			return Rectangle.prototype.equals.call( this, shape, accuracy ) && shape.radius == this.radius;
		},

		dump: function () {
			var p = function (p) { return '[' + p.x + ', ' + p.y + ']'; };
			return '[shape RoundedRectangle(from'+p(this.from)+', to'+p(this.to)+', radius='+this.radius+')]';
		}
});