/*
---

name: "Asteroids.Asteroid"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Asteroids
	- Asteroids.Fly

provides: Asteroids.Asteroid

...
*/

Asteroids.Asteroid = atom.Class({
	Extends  : Asteroids.Fly,
	radius   : 20,
	angle    : 0,
	position : null,

	speed: Asteroids.config.speed.asteroid,
	rotateSpeed: Asteroids.config.speed.asteroidRotate,
	
	initialize: function (options) {
		if (!options) options = {};
		
		this.size  = options.size || 1;
		this.angle = Number.random(0, 359).degree();
		
		this.addEvent('libcanvasSet', function () {
			this.velocity = this.getVelocity();

			this.position = options.position ||
				this.libcanvas.ctx.getFullRectangle().getRandomPoint(50);

			this.setShape(new Circle(this.position, this.radius));
		});
	},
	update: function (time) {
		if (!this.isReady()) return;
		
		this
			.rotate(this.rotateSpeed * time.toSeconds())
			.impulse(this.velocity.clone().mul(time.toSeconds()))
			.checkBounds();
	},
	draw: function () {
		this.parent('red');
	}
});