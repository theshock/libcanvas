window.App = window.App || {};

App.TestElem = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	Implements : [
		LibCanvas.Interfaces.MouseListener,
		LibCanvas.Interfaces.Draggable,
		LibCanvas.Interfaces.Clickable
	],
	style : {
		standart : ["#f99", "#600"],
		hover    : ["#9f9", "#060"],
		active   : ["#99f", "#006"]
	},
	draw : function () {
		var coord = this.shape.from || this.shape;
		
		var type = this.active ? "active" :
			this.hover  ? "hover" : "standart";

		this.canvas.ctx
			.fill(this.shape, this.style[type][0])
			.stroke(this.shape, this.style[type][1])
			.fillText(this.zIndex, coord.x + 5, coord.y + 5, 100);
	}
});