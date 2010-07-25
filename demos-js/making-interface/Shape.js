Interface.Shape = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	Implements : [
		LibCanvas.Interfaces.MouseListener,
		LibCanvas.Interfaces.Draggable,
		LibCanvas.Interfaces.Clickable,
		LibCanvas.Interfaces.Linkable,
		LibCanvas.Interfaces.Moveable,
		LibCanvas.Interfaces.Droppable
	],
	style : {
		standart : ["#f99", "#600"],
		hover    : ["#9f9", "#060"],
		active   : ["#99f", "#006"]
	},
	getCoords : function () {
		if (this.shape instanceof LibCanvas.Shapes.Rectangle) {
			return this.shape.from;
		} else if (this.shape instanceof LibCanvas.Shapes.Circle) {
			return this.shape.center;
		} else if (this.shape instanceof LibCanvas.Shapes.Polygon) {
			return this.shape[0];
		} else {
			return null;
		}
	},
	draw : function () {
		this.canvas.ctx.save();

		var type = this.active ? "active" :
			this.hover  ? "hover" : "standart";

		if (this.lineWidth) {
			this.canvas.ctx.set('lineWidth', this.lineWidth);
		}

		this.canvas.ctx
			.fill(this.shape, this.style[type][0])
			.stroke(this.shape, this.style[type][1])
			.restore();
	}
});