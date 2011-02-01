/*
---

name: "Behaviors.Draggable"

description: "When object implements LibCanvas.Behaviors.Draggable interface dragging made possible"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.MouseListener

provides: Behaviors.Draggable

...
*/

(function () {

LibCanvas.namespace('Behaviors').Draggable = atom.Class({
	isDraggable : null,
	dragStart : null,
	returnToStart : function (speed) {
		return !this.dragStart ? this : this.moveTo(this.dragStart, speed);
	},
	draggable : function (stopDrag) {
		if (this.isDraggable === null) {
			this.addEvent('libcanvasSet', initDraggable.context(this));
		}
		this.isDraggable = !stopDrag;
		return this;
	}
});

var moveListener = function () {
	if (this.isDraggable && this.prevMouseCoord) {
		var mouse = this.libcanvas.mouse;
			var move  = this.prevMouseCoord.diff(mouse.point);
		this.shape.move(move);
		this.fireEvent('moveDrag', [move]);
		this.prevMouseCoord.set(mouse.point)
	}
};

var initDraggable = function () {
	var dragFn = moveListener.context(this);

	this.listenMouse();

	var startDrag = ['mousedown'];
	var dragging  = ['mousemove', 'away:mousemove'];
	var stopDrag  = ['mouseup', 'away:mouseup', 'away:mouseout'];

	return this
		.addEvent(startDrag, function () {
			if (this.isDraggable) {
				this.fireEvent('startDrag');
				if (this.getCoords) this.dragStart = this.getCoords().clone();
				this.prevMouseCoord = this.libcanvas.mouse.point.clone();
				this.addEvent(dragging, dragFn);
			}
		})
		.addEvent(stopDrag, function () {
			if (this.isDraggable && this.prevMouseCoord) {
				this.fireEvent('stopDrag').removeEvent(dragging, dragFn);
				delete this.prevMouseCoord;
			}
		});
};

})();