/*
---

name: "LibCanvas.Behaviors.Droppable"

description: "Abstract class for droppable canvas objects"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
- "Shock <shocksilien@gmail.com>"

requires:
- LibCanvas
- LibCanvas.Behaviors.Bindable
- LibCanvas.Behaviors.MouseListener
- LibCanvas.Behaviors.Draggable

provides: LibCanvas.Behaviors.Droppable

...
*/

LibCanvas.namespace('Behaviors').Droppable = atom.Class({
	drops : null,
	drop : function (obj) {
		if (this.drops === null) {
			this.drops = [];
			this.bind('stopDrag', function () {
				var dropped = false;
				var mouse = this.libcanvas.mouse;
				if (mouse.inCanvas) {
					this.drops.forEach(function (obj) {
						if(obj.getShape().hasPoint(mouse.point)) {
							dropped = true;
							this.bind('dropped', [obj]);
						}
					}.context(this));
				}
				if (!dropped) this.bind('dropped', [null]);
			}.context(this));
		}
		this.drops.push(obj);
		return this;
	},
	undrop : function (obj) {
		if (this.drops !== null) this.drops.erase(obj);
		return this;
	}
});