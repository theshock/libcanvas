/*
---

name: "Asteroids.Asteroid"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Asteroids
	- Asteroids.Config
	- Asteroids.Stones
	- Asteroids.FlyingObject

provides: Asteroids.Asteroid

...
*/

Asteroids.Asteroid = atom.Class({
	rotation : 0,
	speed    : 0,
	size     : 0,
	spriteShape : 0,
	startingRotation : 0,
	color     : null,
	drawBorder: false,
	zIndex    : 20,

	Extends : Asteroids.FlyingObject,

	initialize : function (size, initialPos, color) {
		// Const
		this.size = size || 1;
		this.startingRotation = this.rotation = (Number.random(1, 180) * 2).degree();
		this.speed = Asteroids.config.speed.asteroid;
		this.color = color || ['red', 'blue'][Number.random(0,1)];

		this.addEvent('libcanvasSet', function () {
			this.full = this.libcanvas.ctx.getFullRectangle();

			// Setting position & initial velocity
			this.velocity = new LibCanvas.Point({
				x :  (this.startingRotation).sin() * this.speed,
				y : -(this.startingRotation).cos() * this.speed
			});

			this.position = new LibCanvas.Point(initialPos || [
				Number.random(50, this.full.getWidth()  - 50),
				Number.random(50, this.full.getHeight() - 50)
			]);
			this.setShape(
				new LibCanvas.Shapes.Circle({
					center: this.position,
					radius: 50 - this.size * 10
				})
			);

			this.spriteShape = Asteroids.Stones[this.color][this.size-1].getRandom();
		});
	},

	update : function (time) {
		// Move
		this
			.rotate((-3).degree())
			.impulse(this.velocity.clone().mul(time))
			.checkBounds();
	},

	getSprite : function () {
		return this.libcanvas
			.getImage('stones')
			.sprite(this.spriteShape);
	},

	draw : function () {
		if (!this.libcanvas || this.hidden) return;

		this.libcanvas.ctx
			.drawImage({
				image  : this.getSprite(),
				center : this.position,
				angle  : this.rotation
			}, false);

		if (this.drawBorder && this.shape) {
			this.libcanvas.ctx.save()
				.set('lineWidth', 2)
				.stroke(this.shape, '#935517')
				.restore();
		}
	}
});