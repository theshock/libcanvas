/*
---

name: "Ui.Draggable"

description: "Ui.Draggable"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples
	- Ui.Core

provides: Ui.Draggable

...
*/

LibCanvas.Examples.set('Ui.Draggable',
	atom.Class({
		Extends: LibCanvas.Examples.Ui,
		start: function (libcanvas) {
			['circle', 'rectangle', 'triangle'].forEach(function (shape, zIndex) {
				this.createShaper(
						this.randomShape(shape),
						zIndex
					)
					.clickable()
					.draggable();
			}.context(this));
		}
	}).factory()
);