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

	context
		.beginPath(20, 20)
		.lineTo(20, 40)
		.lineTo(40, 40)
		.lineTo(40, 20)
		.closePath(20, 20)
		.stroke('red')

});