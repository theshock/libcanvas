window.App = window.App || {};

App.TabValue = new Class({
	initialize : function (image) {
		this.image = image;
	},
	setCanvas : function (canvas) {
		this.canvas = canvas;
		return this;
	},
	draw : function () {
		this.canvas.ctx.drawImage(this.image);
		return this;
	}
});