/*
---

name: "Asteroids.Bullet"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Asteroids
	- Asteroids.Fly

provides: Asteroids.Bullet

...
*/

Asteroids.Bullet = atom.Class({
	Extends : Asteroids.Fly,
	Implements: [LibCanvas.Invoker.AutoChoose],

	animation: null,

	initialize : function (position, angle) {
		this.setZIndex(200);
		this.position = position;
		this.angle    = angle;
		this.speed    = Asteroids.config.speed.bullet;
		this.velocity = this.getVelocity();

		this.addEvent('libcanvasSet', function () {
			this.animation = new Animation()
				.addSprites(this.libcanvas.getImage('shot'), 60)
				.run({
					frames: [
						{sprite: 0, delay: 40},
						{sprite: 1, delay: 40},
						{sprite: 2, delay: 700},
						{sprite: 1, delay: 40},
						{sprite: 0, delay: 40}
					]
				})
				.addEvent('stop', this.die.context(this));
		});
	},

	isDead: false,

	die: function () {
		if (!this.isDead) {
			this.isDead = false;
			this.libcanvas.rmElement(this);
			this.fireEvent('die', [this]);
		}
		return this;
	},

	explode : function () {
		if (!this.isDead) {
			this.libcanvas.addElement(new Asteroids.Explosion(this.position));
		}
		return this.die();
	},

	impulse : function (pos) {
		return this.parent(pos, false);
	},

	update : function (time) {
		// Move
		this.impulse(this.velocity.clone().mul(time.toSeconds())).checkBounds();
		return this;
	},

	draw : function () {
		if (this.hidden) return;

		this.libcanvas.ctx.drawImage({
			image : this.animation.getSprite(),
			center: this.position,
			angle : this.angle - (90).degree()
		});
	}
});