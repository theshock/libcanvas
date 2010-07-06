
LibCanvas.Interfaces.Drawable = new Class({
	Implements : LibCanvas.Interfaces.Bindable,
	setCanvas : function (canvas) {
		this.canvas = canvas;
		this.autoBind('canvasSetted');
		return this;
	},
	getShape : function () {
		return this.shape;
	},
	setShape : function (shape) {
		this.shape = shape;
		return this;
	},
	getZIndex : function () {
		return this.zIndex || 0;
	},
	setZIndex : function (zIndex) {
		this.zIndex = zIndex;
		return this;
	},
	draw : function () {
		throw 'Abstract method "draw"';
	}
});