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
			
			libcanvas
				.listenMouse()
				.set({
					width : 400,
					height: 250
				});
				
			var last = null;
				
			atom(libcanvas.origElem).bind('dblclick', function (e) {
				var coord = libcanvas.mouse.getOffset(e);

				libcanvas.createShaper({
					shape: new Circle(coord, 5),
					fill : '#900'
				})
				.setZIndex(5)
				.draggable();

				if (last) {
					libcanvas.createShaper({
						shape : new Line(coord, last),
						stroke: '#600'
					}).setZIndex(4);
				}

				last = coord;
			});
			
			
		}
	}).factory()
);