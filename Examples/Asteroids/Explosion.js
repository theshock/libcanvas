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

	animation: null,

	initialize : function (position) {
		this.position = position;

		this.addEvent('libcanvasSet', function () {
			this.animation = new Animation()
				.addSprites(this.libcanvas.getImage('explosion'), 162)
				.run({
					delay: 40,
					line : Array.range(0, 9)
				})
				.addEvent('stop', function () {
					this.libcanvas.rmElement(this);
					this.fireEvent('stop', []);
				}.context(this))

			this.libcanvas.getAudio('explosion').playNext();
		});
	},

	draw : function () {
		this.libcanvas.ctx.drawImage({
			image : this.animation.getSprite(),
			center: this.position
		});
	}
});