/*
---

name: "Asteroids"

description: "Asteroids main"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: Asteroids

...
*/

LibCanvas.extract();

window.Asteroids = {};

LibCanvas.Examples.set('Asteroids', function (canvas) {

	new LibCanvas(canvas, {
			fps: 20,
			clear: 'black'
		})
		.set({
			width : 800,
			height: 500
		})
		.fpsMeter()
		.listenKeyboard([
			'up', 'down', 'left', 'right', 'space'
		])
		.addEvent('ready', function () {
			new Asteroids.Controller(this);
		})
		.start();
});