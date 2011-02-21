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
		fps: 25,
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
		},
		stones: {
			yellow: {},
			cyan  : {}
		}
	}
}

LibCanvas.Examples.set('Asteroids', function (canvas) {
	var images = '/files/asteroids/';
	
	atom(canvas).css({ background: 'url("' + images + 'stars.jpg")' });

	new LibCanvas(canvas, {
			fps: Asteroids.config.fps,
			clear: true,
			preloadImages: {
				explosion: images + 'explosion.png',
				fire     : images + 'fire.png',
				ship     : images + 'ship-red.png',
				shot     : images + 'shot.png',
				stones   : images + 'stones.png'
			}
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