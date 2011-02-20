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
		
		this.size     = options.size || 1;
		this.rotation = Number.random(0, 359).degree();
		
		this.addEvent('libcanvasSet', function () {
			this.velocity = new Point({
				x :  this.rotation.sin() * this.speed,
				y : -this.rotation.cos() * this.speed
			});

			this.position = options.position ||
				this.libcanvas.ctx.getFullRectangle().getRandomPoint(50);
		});
	},
	update: function (time) {
		this
			.rotate(this.rotate.speed * time)
			.impulse(this.velocity.clone().mul(time))
			.checkBounds();
	},
	draw: function () {
		this.libcanvas.ctx
			.stroke(new Circle(this.position, this.radius), 'red')
			.stroke(new Line  (this.position, this.position.clone().move({
				x: this.radius * 1.5 * this.angle.cos(),
				y: this.radius * 1.5 * this.angle.sin()
			})), 'red');
	}
});