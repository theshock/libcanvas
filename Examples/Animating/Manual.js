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

	var libcanvas = new LibCanvas(canvas, { clear: true });

	var grip = libcanvas.start()
		.createGrip({
			shape : new LC.Rectangle(25, 25, 25, 25),
			fill  : '#900',
			stroke: '#f00'
		});

	new LC.Animatable({
		get x () {
			return grip.shape.to.x;
		},
		set x (value) {
			return grip.shape.to.x = value;
		}
	})
	.animate({ x: 275 });

});