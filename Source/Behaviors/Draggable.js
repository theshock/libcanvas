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

new function () {

LibCanvas.Behaviors.Draggable = atom.Class({
	Extends: LibCanvas.Behaviors.MouseListener,

	draggable : function (stopDrag) {
		if (! ('draggable.isDraggable' in this) ) {
			this.addEvent('libcanvasSet', initDraggable);
		}
		this['draggable.isDraggable'] = !stopDrag;
		return this;
	}
});

var isDraggable = function (elem, started) {
	return elem['draggable.isDraggable'] && (!started || elem['draggable.mouse']);
};

var moveListener = function () {
	if (!isDraggable(this, true)) return;

	var mouse = this.libcanvas.mouse.point;
	var move  = this['draggable.mouse'].diff(mouse);
	this.shape.move(move);
	this.fireEvent('moveDrag', [move]);
	this['draggable.mouse'].set(mouse)
};

var initDraggable = function () {
	var dragFn = moveListener.bind(this);

	this.listenMouse();

	var startDrag = ['mousedown'];
	var dragging  = ['mousemove', 'away:mousemove'];
	var stopDrag  = ['mouseup', 'away:mouseup', 'away:mouseout'];

	return this
		.addEvent(startDrag, function () {
			if (!isDraggable(this, false)) return;

			this['draggable.mouse'] = this.libcanvas.mouse.point.clone();
			this
				.fireEvent('startDrag')
				.addEvent(dragging, dragFn);
		})
		.addEvent(stopDrag, function () {
			if (!isDraggable(this, true)) return;

			this
				.fireEvent('stopDrag')
				.removeEvent(dragging, dragFn);
			delete this['draggable.mouse'];
		});
};

};