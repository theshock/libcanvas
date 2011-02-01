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
				libcanvas
					.createGrip({
						shape : this.randomShape(shape),
						stroke: '#990000',
						fill  : '#330000',
						hover : {
							stroke: '#ff0000',
							fill  : '#990000'
						},
						active : {
							stroke: '#00ff00',
							fill  : '#009900'
						}
					})
					.setZIndex(zIndex)
					.listenMouse()
					.clickable()
					.draggable();
			}.context(this));
		}
	}).factory()
);