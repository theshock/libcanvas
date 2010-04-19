window.App = window.App || {};

App.TabButton = new Class({
	Extends : LibCanvas.InterfaceElement,
	setDrawFrom : function (drawFrom) {
		this.drawFrom = drawFrom;
		return this;
	},
	setImageBase : function (ib) {
		this.imageBase = ib;
		return this;
	},
	_draw : function (type) {
		// this.canvas.ctx.fill(this.getShape());
		this.canvas.ctx.drawImage({
			image : this.canvas.images[this.imageBase + '-' + type],
			from  : this.drawFrom
		})
		return this;
	},
	drawStandart : function () {
		return this._draw('standart');
	},
	drawHover : function () {
		return this._draw('hover');
	},
	drawActive : function () {
		return this._draw('active');
	},

});