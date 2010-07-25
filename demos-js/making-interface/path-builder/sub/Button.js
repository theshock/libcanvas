PathBuilder.Button = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	Implements : [
		LibCanvas.Interfaces.MouseListener,
		LibCanvas.Interfaces.Clickable
	],
	initialize : function (text, padding) {
		this.text    = text;
		this.padding = padding;
	},
	style : {
		standart : ["#f99", "#600"],
		hover    : ["#9f9", "#060"],
		active   : ["#99f", "#006"]
	},
	draw : function () {
		var type = this.active ? "active" :
			this.hover  ? "hover" : "standart";
		var from = this.shape.from;
		var ctx = this.canvas.ctx;


		var textWidth = ctx
			.set('fillStyle', '#000')
			.set('font', '16px Verdana')
			.measureText(this.text)
			.width;
		var text = {
			x : from.x + (this.shape.width-textWidth)/2,
			y : from.y + this.padding
		};

		ctx
			.fill(this.shape, this.style[type][0])
			.stroke(this.shape, this.style[type][1])
			.fillText(this.text, text.x, text.y);
	}
});