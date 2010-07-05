window.App = window.App || {};

App.TestElem = new Class({
	Extends : LibCanvas.Interfaces.Draggable,
	style : {
		standart : ["#f99", "#600"],
		hover    : ["#9f9", "#060"],
		active   : ["#99f", "#006"]
	},
	setCanvas : function (canvas) {
		this.parent(canvas);
		this.bind('mousedown', function () {
			this.zIndex += 1;
		}.bind(this));
	},
	getZIndex : function () {
		return this.zIndex || 0;
	},
	setZIndex : function (zIndex) {
		this.zIndex = zIndex;
		return this;
	},
	drawActive : function () {
		this.drawMain('active');
	},
	drawHover : function () {
		this.drawMain('hover');
	},
	drawStandart : function () {
		this.drawMain('standart');
	},
	drawMain : function (type) {
		var coord = this.shape.from || this.shape;
		this.canvas.ctx
			.fill(this.shape, this.style[type][0])
			.stroke(this.shape, this.style[type][1])
			.fillText(this.zIndex, coord.x + 5, coord.y + 5, 100);
	}
});