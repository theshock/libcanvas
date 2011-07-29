/*
---

name: "Behaviors.Droppable"

description: "Abstract class for droppable canvas objects"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.MouseListener
	- Behaviors.Draggable

provides: Behaviors.Droppable

...
*/

var Droppable = LibCanvas.Behaviors.Droppable = Class({
	Extends: Draggable,

	drops : null,
	drop : function (obj) {
		if (this.drops === null) {
			this.drops = [];
			this.addEvent('stopDrag', function () {
				var dropped = false;
				var mouse = this.libcanvas.mouse;
				if (mouse.inCanvas) {
					this.drops.forEach(function (obj) {
						if(obj.getShape().hasPoint(mouse.point)) {
							dropped = true;
							this.fireEvent('dropped', [obj]);
						}
					}.bind(this));
				}
				if (!dropped) this.fireEvent('dropped', [null]);
			}.bind(this));
		}
		this.drops.push(obj);
		return this;
	},
	undrop : function (obj) {
		if (this.drops !== null) this.drops.erase(obj);
		return this;
	}
});