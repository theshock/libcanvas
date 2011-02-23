/*
---

name: "Shapes.Rectangle.Points"

description: "Shapes.Rectangle.Points"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: Shapes.Rectangle.Points

...
*/

LibCanvas.Examples.set('Shapes.Rectangle.Points', function (canvas) {
	atom(canvas).css('background', 'url(/files/bg.jpg)');

	var LC = LibCanvas.extract({});

	var libcanvas = new LibCanvas(canvas, {
			clear: true
		})
		.set({
			width : 512,
			height: 256
		})
		.listenMouse()
		.start(function () {
			rect && this.ctx.text({
				padding : [4, 8],
				family  : 'monospace',
				size : 13,
				text : 'Size : ' + rect.width  + '×' + rect.height + '\n'
					 + 'From : ' + rect.from.x + '×' + rect.from.y + '\n'
					 + 'To   : ' + rect. to .x + '×' + rect. to .y
			});
		});


	var rect = new LC.Rectangle(
		new LC.Point(100, 100), new LC.Point(250, 200)
	);

	libcanvas
		.createShaper({
			shape : rect,
			fill   : 'rgba(255, 192, 192, 0.4)',
			stroke : 'rgba(127,   0,   0, 0.4)'
		})
		.clickable()
		.draggable();


	[rect.from, rect.to].forEach(function (point, i) {
		libcanvas
			.createShaper({
				shape  : new LC.Circle(point, 5),
				fill   : "#f99",
				stroke : "#600",
				hover  : { fill : "#9f9", stroke : "#060"},
				active : { fill : "#696", stroke : "#060"}
			})
			.setZIndex(i + 1)
			.clickable()
			.draggable();
	});
});