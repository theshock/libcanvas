/*
---

name: "Asteroids.Controller"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Asteroids

provides: Asteroids.Controller

...
*/

Asteroids.Controller = atom.Class({
	Implements: [LibCanvas.Invoker.AutoChoose],

	initialize: function (libcanvas) {
		this.libcanvas = libcanvas;
		this.bulletOnDie = this.bulletOnDie.context(this);
		this.start();
	},

	start: function () {
		this.invoker.addFunction(10, this.update.context(this));
		this.createAsteroids();

		this.ship = new Asteroids.Ship();
		this.libcanvas.addElement(this.ship);
	},

	update: function (time) {
		this.asteroids.invoke('update', time);
		this.bullets.invoke('update', time);
		this.ship.update(time);
		this.checkCollisions();

		if (this.libcanvas.getKey('space')) {
			var bullet = this.ship.shoot();
			if (bullet) {
				this.libcanvas.addElement(bullet);
				this.bullets.push(bullet);
				bullet.addEvent('die', this.bulletOnDie);
			}
		}
	},

	bulletOnDie: function (bullet) {
		this.bullets.erase(bullet);
	},

	bullets: [],
	asteroids: [],
	
	createAsteroids: function () {
		for (var i = 3; i--;) {
			var asteroid = new Asteroids.Asteroid();
			this.asteroids.push(asteroid);
			this.libcanvas.addElement(asteroid);
		}
	},

	checkCollisions: function () {
		this.checkShipAsteroidsCollisions();
	},
	checkShipAsteroidsCollisions: function () {
		if (this.ship.invulnerable) return this;

		var shape = this.ship.getShape();
		for (var i = this.asteroids.length; i--;) {
			if (shape.intersect(this.asteroids[i].getShape())) {
				this.ship.explode();
				break;
			}
		}
		return this;
	},
	checkBulletsAsteroidsCollisions: function () {
		var b, a, bullet, destroyed, asteroid;
		for (b = this.bullets.length; b--;) {
			bullet    = this.bullets[b],
			destroyed = [];
			for (a = this.asteroids.length; a--;) {
				asteroid = this.asteroids[a];
				if (asteroid.getShape().hasPoint(bullet.position)) {
					destroyed.push(asteroid);
				}
			}

			if (destroyed.length) {
				bullet.explode();

				for (var i = destroyed.length; i--;) {
					this.asteroids.erase(destroyed[i].explode());
				}
			}
		}
	}
});