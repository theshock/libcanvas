/*
---

name: "Ui.Draggable.Layers"

description: "Ui.Draggable.Layers"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples
	- Ui.Core

provides: Ui.Draggable.Layers

...
*/

LibCanvas.Examples.set('Ui.Draggable.Layers',
	atom.Class({
		Extends: LibCanvas.Examples.Ui,
		start: function (libcanvas) {
			this.shaper('triangle', libcanvas);
			
			this.shaper('circle', 
				libcanvas.createLayer('circle-layer')
			);
				
			this.shaper('rectangle', 
				libcanvas.createLayer('rectangle-layer')
			);
		},
		
		shaper: function (shape, layer) {
			return this
				.createShaper(this.randomShape(shape), 1, layer)
				.clickable()
				.draggable();
		}
	}).factory()
);