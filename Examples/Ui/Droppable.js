/*
---

name: "Ui.Droppable"

description: "Ui.Droppable"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples
	- Ui.Core

provides: Ui.Droppable

...
*/

LibCanvas.Examples.set('Ui.Droppable',
	atom.Class({
		Extends: LibCanvas.Examples.Ui,
		/**
		 * Create random Polygon, Rectangle and Circle
		 * If rectangle dropped to circle - add "TraceYesShape" (little circle)
		 * If rectangle dropped out of circle -  add "TraceNoShape" (little rect)
		 */
		start: function (libcanvas) {
			this.shape('triangle', 10);
			this.shape('rectangle', 30)
				.drop(this.shape('circle', 20))
				.addEvent('dropped', this.getTraceFn());
		},
		shape: function (type, z) {
			return this
				.createShaper(this.randomShape(type), z)
				.listenMouse()
				.clickable()
				.draggable();
		},

		// This part just show small circles and rectangle
		// which bind dropes of recngle in or out of circle
		getTraceFn : function () {
			return function (to) {
				this.createShaper(to ?
					this.createTraceYesShape() :
					this.createTraceNoShape()
				);
			}.context(this);
		},
		count : { yes : 0 , no : 0 },
		createTraceYesShape : function () {
			return new LibCanvas.Shapes.Circle({
				from : [ ++this.count.yes * 10, 10 ],
				radius : 4
			});
		},
		createTraceNoShape : function () {
			return new LibCanvas.Shapes.Rectangle({
				from : [ ++this.count.no * 10, 20 ],
				size : [8, 8]
			});
		}
	}).factory()
);