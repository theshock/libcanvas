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
		this.ship.update(time);
		this.checkCollisions();
	},

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
	}
});