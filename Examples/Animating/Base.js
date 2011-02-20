/*
---

name: "Animating.Base"

description: "Animating.Base"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: Animating.Base

...
*/

LibCanvas.Examples.set('Animating.Base', function (canvas) {
	var LC = LibCanvas.extract({});

	var libcanvas = new LibCanvas(canvas, { clear: true });

	var grip = libcanvas.start()
		.createGrip({
			shape : new LC.Circle(150, 75, 15),
			fill  : '#900',
			stroke: '#f00'
		});

	(function () {
		new LC.Animatable(grip.shape)
			.animate({ radius: 75 });
	}.delay(1000));

});