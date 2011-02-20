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

window.Asteroids = {};

LibCanvas.Examples.set('Asteroids', function (canvas) {
	var fps = atom.uri().queryKey.fps;

	var size = Asteroids.config.canvas.size;

	var libcanvas = atom.extend(
			new LibCanvas(canvas),
			{
				fps: fps || 1,
				preloadImages   : Asteroids.config.canvas.images,
				progressBarStyle: Asteroids.config.canvas.progressBar
			}
		)
		.set({
			width : size[0],
			height: size[1]
		})
		.fpsMeter()
		.listenKeyboard([
			'up', 'down', 'left', 'right', 'space'
		]);

	Asteroids.Audio = new LibCanvas.Utils.AudioContainer({
		shot      : '/files/sounds/shot.*',
		ship      : '/files/sounds/ship-engine.*',
		explosion : '/files/sounds/explosion.*',
		shipStart : '/files/sounds/starting-ship-engine.*'
	});

	Asteroids.Audio.get('shot').gatling(6);
	Asteroids.Audio.get('explosion').gatling(6);

	libcanvas
		.addProcessor('pre', new LibCanvas.Processors.Clearer('black'))
		.addEvent('ready', function () {
			this.addElement(new Asteroids.Controller());
		})
		.start();
});