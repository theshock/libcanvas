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

	initialize : function (position, onStrike, onStop) {
		this.bind('libcanvasSet', function () {
			Asteroids.Audio.get('explosion').playNext();
			this.setZIndex(150);
			this.position = position;
			this.initAnimation()
				.addEvent('frame:strike', onStrike || $empty)
				.addEvent('stop', function () {
					onStop && onStop();
					this.libcanvas.rmElement(this);
				}.context(this));
		});
	},
	
	initAnimation : function () {
		var img = this.libcanvas.getImage('explosion');
		this.animation = new LibCanvas.Animation();
		for (var i = 0; i < 10; i++) {
			this.animation.addSprite(i, img.sprite(162*i, 0, 162, 130));
		}
		return this.animation.add({
			name  : 'main',
			frames : [
				{ sprite : 0, delay : 40 },
				{ sprite : 1, delay : 40 },
				{ sprite : 2, delay : 40, name : 'strike' },
				{ sprite : 3, delay : 40 },
				{ sprite : 4, delay : 40 },
				{ sprite : 5, delay : 40 },
				{ sprite : 6, delay : 40 },
				{ sprite : 7, delay : 40 },
				{ sprite : 8, delay : 40 },
				{ sprite : 9, delay : 40 }
			]
		}).run('main');
	},

	draw : function () {
		this.libcanvas.ctx.drawImage({
			image  : this.animation.getSprite(),
			center : this.position
		});
	}
});