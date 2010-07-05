
LibCanvas.Interfaces.Drawable = new Class({
	Implements : LibCanvas.Interfaces.Bindable,
	setShape : function (shape) {
		this.shape = shape;
		return this;
	},
	getShape : function () {
		return this.shape;
	},
	setCanvas : function (canvas) {
		this.canvas = canvas;
		this.bind('canvasSetted');
		return this;
	},
	draw : function () {
		throw 'Abstract method "draw"';
	},
	getZIndex : function () {
		return this.zIndex || 0;
	},
	setZIndex : function (zIndex) {
		this.zIndex = zIndex;
		return this;
	}
});