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

	var libcanvas = new LibCanvas(canvas);

	var shaper = libcanvas.start()
		.createShaper({
			shape : new LC.Circle(150, 75, 15),
			fill  : '#900',
			stroke: '#f00'
		});

	(function () {
		new LC.Animatable(shaper.shape)
			.animate({
				props: { radius: 75 },
				onProccess: libcanvas.update,
				time: 2000
			});
	}.delay(1000));

});