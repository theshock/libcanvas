/*
---

name: "Trace"

description: "Trace"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: Trace

...
*/

LibCanvas.Examples.set('Trace',
	function (canvas) {
		LibCanvas.extract();
		
		new Trace({
			libcanvas: new LibCanvas(canvas),
			circle   : new Circle(8, 7, 4),
			rectangle: new Rectangle(5, 6, 1, 3),
			point    : new Point (3, 4),
			element  : canvas,
			string   : 'test string',
			number   : 42,
			bool     : true,
			array    : [10, 20, 'else', ['test', 50, false]],
			subObject: {
				x: 1, y: 1, z: new Point(2, 3)
			}
		});
	}
);