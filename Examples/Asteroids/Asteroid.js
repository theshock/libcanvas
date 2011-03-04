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

new function () {

var cfg = Asteroids.config;

Asteroids.Asteroid = atom.Class({
	Extends  : Asteroids.Fly,
	radius   : 30,
	angle    : 0,
	position : null,

	colors     : Object.keys(cfg.stones),
	speed      : cfg.speed.asteroid,
	rotateSpeed: cfg.speed.asteroidRotate,
	
	initialize: function (options) {
		if (!options) options = {};
		
		this.size   = options.size || 0;
		this.color  = options.color || this.colors.random();
		this.angle  = Number.random(0, 359).degree();
		this.radius = [35, 26, 15][this.size];
		
		this.addEvent('libcanvasSet', function () {
			this.image = this.libcanvas.getImage('stones').sprite(
				cfg.stones[this.color][this.size].random()
			);

			this.velocity = this.getVelocity();

			this.position = options.position ||
				this.libcanvas.ctx.getFullRectangle().getRandomPoint(50);

			this.setShape(new Circle(this.position, this.radius ));
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
		if (decay && this.size < 2) {
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
		this.libcanvas.ctx.drawImage({
			image : this.image,
			center: this.position,
			angle : this.angle
		});

		this.parent(this.color);
	}
});

};