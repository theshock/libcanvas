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
	initialize: function (libcanvas) {
		this.libcanvas = libcanvas;
		this.start();
	},

	start: function () {
		atom.log('started');
	}
});