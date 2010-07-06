(function () {


LibCanvas.Interfaces.Draggable = new Class({
	isDraggable : null,
	draggable : function (stopDrag) {
		if (this.isDraggable === null) {
			this.bind('canvasSetted', initDraggable.bind(this));
		}
		this.isDraggable = !stopDrag;
		return this;
	}
});

var moveListener = function () {
	if (this.isDraggable && this.prevMouseCoord) {
		var mouse = this.canvas.mouse;
		var move  = this.prevMouseCoord.diff(mouse.dot);
		this.shape.move(move);
		this.bind('moveDrag', [move]);
		this.prevMouseCoord.set(mouse.dot)
	}
};

var initDraggable = function () {
	var draggable = this;
	var dragFn = function () {
		moveListener.call(draggable);
	}.bind(this);

	var startDrag = ['mousedown'];
	var dragging  = ['mousemove', 'away:mousemove'];
	var stopDrag  = ['mouseup', 'away:mouseup', 'away:mouseout'];

	return this
		.bind(startDrag, function () {
			draggable.bind('startDrag');
			draggable.prevMouseCoord = new LibCanvas.Dot(
				draggable.canvas.mouse.dot
			);
			draggable.bind(dragging, dragFn);
		})
		.bind(stopDrag, function () {
			if ($chk(draggable.prevMouseCoord)) {
				draggable
					.bind('stopDrag')
					.unbind(dragging, dragFn);
				delete draggable.prevMouseCoord;
			}
		});
};

})();