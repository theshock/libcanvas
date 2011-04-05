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

new function () {

LibCanvas.extract();

window.Asteroids = {
	config: {
		fps: 25,
		boundsDistance: 30,
		showShapes: false,
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
	var files = '/files/asteroids/';
	
	atom.dom(canvas).css({ background: 'url("' + files + 'images/stars.jpg")' });

	new LibCanvas(canvas, {
			fps: Asteroids.config.fps,
			clear: true,
			preloadImages: {
				explosion: files + 'images/explosion.png',
				fire     : files + 'images/fire.png',
				ship     : files + 'images/ship-red.png',
				shot     : files + 'images/shot.png',
				stones   : files + 'images/stones.png'
			},
			preloadAudio: {
				shot      : files + 'sounds/shot.*',
				explosion : files + 'sounds/explosion.*'
			}
		})
		.size(Asteroids.config.canvasSize, true)
		.fpsMeter()
		.listenKeyboard([
			'aup', 'adown', 'aleft', 'aright', 'space'
		])
		.addEvent('ready', function () {
			new Asteroids.Controller(this);
			this.getAudio('shot').gatling(6);
			this.getAudio('explosion').gatling(12);
		})
		.start();
});

Asteroids.config.stones = new function () {
	var rect = function () {
		return Rectangle.factory(arguments);
	};

	return {
		yellow:[
			[
				rect(  2,   4, 70, 64),
				rect( 83,   6, 53, 60)
			], [
				rect(  2,  85, 32, 37),
				rect( 40,  83, 44, 41),
				rect( 91,  82, 45, 42)
			], [
				rect(  2, 138, 23, 23),
				rect( 31, 137, 26, 28),
				rect( 62, 138, 30, 24),
				rect( 97, 140, 23, 20),
				rect(126, 142, 18, 18)
			]
		],
		cyan:  [
			[
				rect(147,   3, 69, 69),
				rect(241,   8, 55, 55)
			], [
				rect(144,  82, 47, 44),
				rect(196,  86, 41, 39),
				rect(243,  72, 52, 52)
			], [
				rect(156, 141, 26, 19),
				rect(194, 140, 20, 21),
				rect(224, 142, 18, 19),
				rect(251, 140, 17, 20),
				rect(280, 141, 18, 19)
			]
		]
	};
};

};