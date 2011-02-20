/*
---

name: "Asteroids.Explosion"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- Asteroids

authors:
	- "Shock <shocksilien@gmail.com>"

provides: Asteroids.Explosion

...
*/

Asteroids.Explosion = atom.Class({
	position : null,

	Extends : LibCanvas.Behaviors.Drawable,
	Implements: [
		atom.Class.Events,
		LibCanvas.Invoker.AutoChoose
	],

	initialize : function (position) {
		this.setShape(new Circle(position, 50));

		this.addEvent('libcanvasSet', function () {
			this.invoker.after(2000, function () {
				this.libcanvas.rmElement(this);
				this.fireEvent('stop');
			}.context(this));
		});
	},

	draw : function () {
		this.libcanvas.ctx.fill(this.getShape(), '#f96');
	}
});