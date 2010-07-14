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
		var stroke = this.active ? '#093' :
			this.hover ? '#930' : '#000';
		var ctx = this.canvas.ctx;

		ctx.save().set('lineWidth', this.active || this.hover ? 2 : 1);

		this.connections.each(function (connection) {
			ctx.stroke(connection, '#99c');
		});

		ctx
			.fill(this.shape, this.color)
			.stroke(this.shape, stroke)
			.restore();
	}
});