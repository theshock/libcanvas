/*
---

name: "Animating.Fn"

description: "Animating.Fn"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: Animating.Fn

...
*/

LibCanvas.Examples.set('Animating.Fn', function (canvas) {
	var LC = LibCanvas.extract({});

	var libcanvas = new LibCanvas(canvas, { clear: true });

	var grip = libcanvas.start()
		.createGrip({
			shape : new LC.Circle(75, 75, 25),
			fill  : '#900',
			stroke: '#f00'
		});

	(function () {
		new LC.Animatable(grip.shape)
			.animate({ 
				props: { x : 225 },
				fn   : 'bounce-out',
				time : 3000
			});
	}.delay(1000));

});