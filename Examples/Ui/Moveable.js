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

new function () {

var LC   = LibCanvas.extract({}),
	rand = Number.random;

var Moveable = atom.Class({
	Extends: LibCanvas.Examples.Ui,
	start: function (libcanvas) {
		libcanvas
			.createGrip({
				shape: new LC.Circle({
					center: [20, 20],
					radius: 20
				}),
				stroke: '#990000',
				fill: '#330000'
			})
			.listenMouse()
			.addEvent('away:mousedown', function (e) {
				this.moveTo(e.offset, rand(70, 250));
			});
	}
});

LibCanvas.Examples.set('Ui.Moveable', new Moveable());

}();