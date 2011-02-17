/*
---

name: "Context.Path"

description: "Context.Path"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: Context.Path

...
*/

LibCanvas.Examples.set('Context.Path', function (canvas) {
	var context = canvas.getContext('2d-libcanvas');

	// .5 нужно для того, чтобы не блурило
	context
		.beginPath(20.5, 20.5)
		.lineTo   (20.5, 40.5)
		.lineTo   (40.5, 40.5)
		.lineTo   (40.5, 20.5)
		.closePath(20.5, 20.5)
		.stroke('red')

});