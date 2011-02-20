/*
---

name: "Asteroids.Ship"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Asteroids
	- Asteroids.Fly

provides: Asteroids.Ship

...
*/

new function () {

var speed = Asteroids.config.speed;

Asteroids.Ship = atom.Class({
	Extends : Asteroids.Fly,

	speed      : speed.ship,
	friction   : speed.shipFriction,
	rotateSpeed: speed.shipRotate,
	zIndex: 60,
	radius: 30,
	reload: 0,
	invulnerable: true,
	hidden: true,

	initialize: function () {
		// Const
		this.angle    = 0;
		this.velocity = new Point(0, 0);

		this.addEvent('libcanvasSet', function () {
			this.full = this.libcanvas.ctx.getFullRectangle();
			// Setting position
			this.position = this.full.getCenter();

			this.setShape(new Circle({
				center: this.position, radius: this.radius
			}));

			this.respawn(false);
		});
	},

	update: function (time) {
		if (!this.isReady()) return;
		
		var key = this.libcanvas.getKey.context(this.libcanvas);

		// Weapon reloading
		this.reload = (this.reload - time).limit(0);

		time = time.toSeconds();
		// Rotation
		if (key('aleft') || key('aright')) {
			this.rotate(this.rotateSpeed * time, key('aleft'));
		}
		// Move
		if (key('aup') || key('adown')) {
			this.velocity.move(this.getVelocity().mul(time), key('adown'));
		}
		this.impulse(this.velocity).checkBounds();
		this.velocity.mul(this.friction);
	},

	draw: function () {
		this.parent('#f0f');
	},

	explode: function () {
		this.stop();
		this.invulnerable = true;
		this.hidden = true;
		this.libcanvas.addElement(
			new Asteroids.Explosion(this.position.clone())
				.addEvent('stop', this.respawn.context(this, [true]))
		);
		return this;
	},

	makeInvulnerable: function () {
		this.invulnerable = true;
		this.hidden       = false;
		this.blink(2000, function () {
			this.invulnerable = false;
		});
	},

	respawn: function (random) {
		this.rotate(-this.angle);
		if (random) this.position.moveTo(this.full.getRandomPoint(50));
		this.blink(2000, function () {
			this.invulnerable = false;
			this.hidden       = false;
		});
	},

	blink: function (time, fn) {
		var blinker = function (error) {
			blinker.fn && blinker.fn(error);
		};
		blinker.fn = function (error) {
			this.hidden = !this.hidden;
			this.invoker.after(250 - error, blinker);
		}.context(this)

		blinker(0);

		this.invoker.after(time, function () {
			blinker.fn = null;
			this.hidden = false;
			fn.call(this);
		}.context(this));

		return this;
	},

	shoot: function () {
		if (this.invulnerable || this.reload > 0) return null;
		this.reload = 300;
		return new Asteroids.Bullet(this.position.clone(), this.angle);
	},


});

}