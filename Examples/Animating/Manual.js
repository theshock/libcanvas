/*
---

name: "Animating.Manual"

description: "Animating.Manual"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: Animating.Manual

...
*/

LibCanvas.Examples.set('Animating.Manual', function (canvas) {
	var LC = LibCanvas.extract({});

	var libcanvas = new LibCanvas(canvas);

	var shaper = libcanvas.start()
		.createShaper({
			shape : new LC.Rectangle(25.5, 25.5, 25, 25),
			fill  : 'rgb(150,0,0)',
			stroke: '#f00'
		});

	var anim = new LC.Animatable({
		get x () {
			return shaper.shape.to.x;
		},
		set x (value) {
			return shaper.shape.to.x = value;
		}
	})
	.animate({
		props: { x: 274.5 },
		onProccess: libcanvas.update,
		time: 2000
	})

});