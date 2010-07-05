

LibCanvas.Interfaces.Draggable = new Class({
	Extends : LibCanvas.InterfaceElement,
	isDraggable : true,
	moveListener : function () {
		if (this.isDraggable && this.prevMouseCoord) {
			var mouse = this.canvas.mouse;
			this.shape.move(
				this.prevMouseCoord.diff(mouse.dot)
			);
			this.prevMouseCoord.set(mouse.dot)
		}
	},
	setCanvas : function (canvas) {
		this.parent(canvas);

		var draggable = this;
		var listen = function () {
			draggable.moveListener();
		}.bind(this);

		return this
			.bind('mousedown', function () {
				draggable.prevMouseCoord = new LibCanvas.Dot(
					draggable.canvas.mouse.dot
				);
				draggable.bind(['mousemove', 'away:mousemove'], listen);
			})
			.bind(['mouseup', 'away:mouseup'], function () {
				draggable.unbind(['mousemove', 'away:mousemove'], listen);
				delete draggable.prevMouseCoord;
			});
	},
	draggable : function (on) {
		if (arguments.length) {
			this.isDraggable = !!on;
			return this;
		} else {
			return this.isDraggable;
		}
	}
});