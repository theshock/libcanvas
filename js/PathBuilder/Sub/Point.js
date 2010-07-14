PathBuilder.Point = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	Implements : [
		LibCanvas.Interfaces.MouseListener,
		LibCanvas.Interfaces.Clickable,
		LibCanvas.Interfaces.Draggable,
		LibCanvas.Interfaces.Linkable
	],
	initialize : function (color) {
		this.color = color;
	},
	setShape : function (point) {
		this.shape = new LibCanvas.Shapes.Circle({
			center : point,
			radius : 5
		});
		return this;
	},
	connections : [],
	setConnected : function (to) {
		this.connections.push(new LibCanvas.Shapes.Line(
			this.shape.center, to
		));
		return this;
	},
	draw : function () {
		var stroke = this.active ? '#039' :
			this.hover ? '#930' : '#000';
		var ctx = this.canvas.ctx;

		var focus = this.active || this.hover;

		ctx.save().set('lineWidth', 1).set('strokeStyle', '#99c');

		this.connections.each(function (connection) {
			ctx.stroke(connection, focus ? stroke : null);
		});

		ctx
		//	.set('lineWidth', focus ? 2 : 1)
			.fill(this.shape, this.color)
			.stroke(this.shape, stroke)
			.restore();
	}
});