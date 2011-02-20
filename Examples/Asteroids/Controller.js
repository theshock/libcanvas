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
	},

	update: function (time) {
		this.asteroids.invoke('update', time);
	},

	asteroids: [],
	createAsteroids: function () {
		for (var i = 10; i--;) {
			var asteroid = new Asteroids.Asteroid();
			this.asteroids.push(asteroid);
			this.libcanvas.addElement(asteroid);
		}
		
	}
});