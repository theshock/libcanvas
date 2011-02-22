/*
---

name: "Animating.Looped"

description: "Animating.Looped"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: Animating.Looped

...
*/

LibCanvas.Examples.set('Animating.Looped', function (canvas) {
	var LC = LibCanvas.extract({});

	var libcanvas = new LibCanvas(canvas, { clear: true });

	var shaper = libcanvas.start()
		.createShaper({
			shape : new LC.Circle(75, 75, 15),
			fill  : '#900',
			stroke: '#f00'
		});

	var Ani = new LC.Animatable(shaper.shape);

	// Changing size
	var decrease = function () {
		Ani.animate({
			props: { radius: 15 },
			time : 3000,
			onFinish: increase
		});
	};
	var increase = function () {
		Ani.animate({
			props: { radius: 60 },
			time : 500,
			onFinish: decrease
		});
	};
	increase();


	// Moving left/right
	var left = function (){
		Ani.animate({
			props: { x : 60 },
			time : 2500,
			onFinish: right
		});
	};
	var right = function (){
		Ani.animate({
			props: { x : 240 },
			time : 7500,
			onFinish: left
		});
	};
	right()
	
});