PathBuilder.ReadyPath = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	Implements : [
		LibCanvas.Interfaces.MouseListener,
		LibCanvas.Interfaces.Clickable,
		LibCanvas.Interfaces.Draggable,
		LibCanvas.Interfaces.Linkable
	],
	draw : function () {
		var stroke = this.active ? '#093' :
			this.hover ? '#930' : '#000';
		this.canvas.ctx
			.save()
			.set('lineWidth', 3)
			.stroke(this.shape, stroke)
			.restore();
	}
});