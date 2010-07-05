(function () {


LibCanvas.Interfaces.Draggable = new Class({
	isDraggable : null,
	draggable : function (on) {
		if (this.isDraggable === null) {
			this.bind('canvasSetted', function () {
				initDraggable.call(this);
			}.bind(this));
		}
		this.isDraggable = !!on;
		return this;
	}
});

var moveListener = function () {
	if (this.isDraggable && this.prevMouseCoord) {
		var mouse = this.canvas.mouse;
		this.shape.move(
			this.prevMouseCoord.diff(mouse.dot)
		);
		this.prevMouseCoord.set(mouse.dot)
	}
};

var initDraggable = function () {
	var draggable = this;
	var listen = function () {
		moveListener.call(draggable);
	};

	var startDrag = ['mousedown'];
	var dragging  = ['mousemove', 'away:mousemove'];
	var stopDrag  = ['mouseup', 'away:mouseup', 'away:mouseout'];

	return this
		.bind(startDrag, function () {
			draggable.prevMouseCoord = new LibCanvas.Dot(
				draggable.canvas.mouse.dot
			);
			draggable.bind(dragging, listen);
		})
		.bind(stopDrag, function () {
			draggable.unbind(dragging, listen);
			delete draggable.prevMouseCoord;
		});
};

})();