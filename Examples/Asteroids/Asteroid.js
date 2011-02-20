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
	radius   : 30,
	angle    : 0,
	position : null,

	speed: Asteroids.config.speed.asteroid,
	rotateSpeed: Asteroids.config.speed.asteroidRotate,
	
	initialize: function (options) {
		if (!options) options = {};
		
		this.size  = options.size || 1;
		this.color = options.color || ['#ff0', '#0ff'].random();
		this.angle = Number.random(0, 359).degree();
		
		this.addEvent('libcanvasSet', function () {
			this.velocity = this.getVelocity();

			this.position = options.position ||
				this.libcanvas.ctx.getFullRectangle().getRandomPoint(50);

			this.setShape(new Circle(this.position, (this.radius / this.size).floor() ));
		});
	},
	update: function (time) {
		if (!this.isReady()) return;
		
		this
			.rotate(this.rotateSpeed * time.toSeconds())
			.impulse(this.velocity.clone().mul(time.toSeconds()))
			.checkBounds();
	},
	explode: function (decay) {
		this.libcanvas.rmElement(this);
		if (decay && this.size < 3) {
			for (var c = 3; c--;) {
				decay(new this.self({
					position: this.position.clone(),
					size : this.size+1,
					color: this.color
				}));
			}
		}
		return this;
	},
	draw: function () {
		this.parent(this.color);
	}
});