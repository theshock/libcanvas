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

	var libcanvas = new LibCanvas(canvas);

	var shaper = libcanvas.start()
		.createShaper({
			shape : new LC.Circle(150, 75, 60),
			fill  : '#900',
			stroke: '#f00',
			lineWidth: 7
		});

	// Changing size and color
	shaper.animate({
		props: {
			radius: 15,
			fill  : '#2d2d2d',
			stroke: '#4c4c4c',
			lineWidth: 1
		},
		time : 1200,
		onFinish: function (prevAnim, prevProps) {
			shaper.animate({
				props: prevProps,
				fn : 'bounce-out',
				time : 800,
				onFinish: prevAnim.repeat
			});
		}
	});
	
});