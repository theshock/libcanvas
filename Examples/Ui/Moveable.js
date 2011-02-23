/*
---

name: "Ui.Moveable"

description: "Ui.Moveable"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples
	- Ui.Core

provides: Ui.Moveable

...
*/

LibCanvas.Examples.set('Ui.Moveable',
	atom.Class({
		Extends: LibCanvas.Examples.Ui,
		start: function (libcanvas) {
			libcanvas
				.createShaper({
					shape : this.randomShape('circle'),
					stroke: '#900',
					fill  : '#300'
				})
				.listenMouse()
				.addEvent('away:mousedown', function (e) {
					this.moveTo(e.offset, Number.random(70, 250));
				});
		}
	}).factory()
);