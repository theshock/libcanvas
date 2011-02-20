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

	update: function () {
		console.log('upd');
	},

	createAsteroids: function () {
		this.libcanvas.addElement(new Asteroids.Asteroid);
	}
});