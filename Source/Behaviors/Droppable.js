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

// must be Draggable
var Droppable = declare( 'LibCanvas.Behaviors.Droppable', {
	drops : null,
	drop : function (obj) {
		if (this.drops === null) {
			this.drops = [];
			this.events.add('stopDrag', function () {
				var dropped = false;
				var mouse = this.libcanvas.mouse;
				if (mouse.inCanvas) {
					this.drops.forEach(function (obj) {
						if(obj.shape.hasPoint(mouse.point)) {
							dropped = true;
							this.events.fire('dropped', [obj]);
						}
					}.bind(this));
				}
				if (!dropped) this.events.fire('dropped', [null]);
			});
		}
		this.drops.push(obj);
		return this;
	},
	undrop : function (obj) {
		if (this.drops !== null) this.drops.erase(obj);
		return this;
	}
});