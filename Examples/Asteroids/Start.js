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

window.Asteroids = {
	config: {
		boundsDistance: 30,
		canvasSize: {
			width : 800,
			height: 500
		},
		speed: {
			asteroid:  70.0,
			bullet  : 500.0,
			ship    :  10.0,
			shipFriction  : 0.95,
			shipRotate    : (120).degree(),
			asteroidRotate: (60).degree()
		}
	}
}

LibCanvas.Examples.set('Asteroids', function (canvas) {
	new LibCanvas(canvas, {
			fps: 25,
			clear: 'black',
			backBuffer: 'off'
		})
		.set(Asteroids.config.canvasSize)
		.fpsMeter()
		.listenKeyboard([
			'aup', 'adown', 'aleft', 'aright', 'space'
		])
		.addEvent('ready', function () {
			new Asteroids.Controller(this);
		})
		.start();
});