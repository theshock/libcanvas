/*
---

name: "Ui.Lines"

description: "Ui.Lines"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples
	- Ui.Core

provides: Ui.Lines

...
*/

LibCanvas.Examples.set('Ui.Lines',
	atom.Class({
		Extends: LibCanvas.Examples.Ui,
		start: function (libcanvas) {
			LibCanvas.extract({});
			
			libcanvas.listenMouse();
			
			var last = null, userInterface = this;
			
			libcanvas.mouse.addEvent('dblclick', function (e) {
				var coord = e.offset;

				userInterface
					.createShaper(new Circle(coord, 5), 5)
					.clickable()
					.draggable();

				if (last) userInterface.createShaper(new Line(coord, last), 4)

				last = coord;
			});
			
			
		}
	}).factory([{
		width : 400,
		height: 250
	}])
);