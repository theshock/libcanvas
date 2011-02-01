/*
---

name: "Ui.Moveable"

description: "Ui.Moveable"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: Ui.Moveable

...
*/

new function () {

var LC     = LibCanvas.extract({}),
	rand   = Number.random,
	width  = 400,
	height = 250;

LibCanvas.Examples.set('Ui.Moveable', function (canvas) {
	var libcanvas = new LibCanvas(canvas);
	libcanvas.listenMouse();
	libcanvas.fps = 50;
	libcanvas.autoUpdate = 'onRequest';

	libcanvas.addProcessor('pre', new LibCanvas.Processors.Clearer());
for (var i = 5; i--;)
	libcanvas
		.set({
			width : width,
			height: height
		})
		.createGrip({
			shape: new LC.Circle({
				center: [20, 20],
				radius: 20
			}),
			stroke: '#990000',
			fill: '#330000'
		})
		.listenMouse()
		.bind('away:mousedown', function (e) {
			this.moveTo(e.offset, rand(70, 250));
		});

	libcanvas.start();
});

}();