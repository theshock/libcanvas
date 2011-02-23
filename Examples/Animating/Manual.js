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
		},
		get y () {
			return shaper.shape.to.y;
		},
		set y (value) {
			return shaper.shape.to.y = value;
		},
		get color () {
			return shaper.options.fill;
		},
		set color (value) {
			shaper.options.fill = value;
		},
		get border () {
			return shaper.options.stroke;
		},
		set border (value) {
			shaper.options.stroke = value;
		}
	})
	.animate({
		props: { x: 274.5, color: '#090', border: '#fff' },
		time: 2000,
		fn: 'quint-in',
		onProccess: libcanvas.update,
		onFinish: function () {
			this.animate({
				props : { y: 124.5, color: '#009', border: '#66f' },
				fn    : 'bounce-out',
				time  : 1500,
				onProccess: libcanvas.update
			});
		}
	})

});