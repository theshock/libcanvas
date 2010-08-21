/*
---
description: When object implements LibCanvas.Behaviors.Draggable interface dragging made possible

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Draggable]
*/ 

(function () {

LibCanvas.Behaviors.Draggable = new Class({
	isDraggable : null,
	dragStart : null,
	returnToStart : function (speed) {
		return !this.dragStart ? this :
			this.moveTo(this.dragStart, speed);
	},
	draggable : function (stopDrag) {
		if (this.isDraggable === null) {
			this.bind('libcanvasSet', initDraggable.bind(this));
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
		this.bind('moveDrag', [move]);
		this.prevMouseCoord.set(mouse.point)
	}
};

var initDraggable = function () {
	var dragFn = function () {
		moveListener.call(this);
	}.bind(this);

	this.listenMouse();

	var startDrag = ['mousedown'];
	var dragging  = ['mousemove', 'away:mousemove'];
	var stopDrag  = ['mouseup', 'away:mouseup', 'away:mouseout'];

	return this
		.bind(startDrag, function () {
			if (this.isDraggable) {
				this.bind('startDrag');
				if (this.getCoords) {
					this.dragStart = new LibCanvas.Point(
						this.getCoords()
					);
				}
				this.prevMouseCoord = new LibCanvas.Point(
					this.libcanvas.mouse.point
				);
				this.bind(dragging, dragFn);
			}
		})
		.bind(stopDrag, function () {
			if (this.isDraggable && this.prevMouseCoord) {
				this
					.bind('stopDrag')
					.unbind(dragging, dragFn);
				delete this.prevMouseCoord;
			}
		});
};

})();