
LibCanvas.InterfaceElement = new Class({
	initialize : function (shape) {
		this.shape = shape;
	},
	setCanvas : function (canvas) {
		this.canvas = canvas;
		this.canvas.mouse.subscribe(this);
		return this;
	},
	getShape : function () {
		return this.shape;
	},
	event : function (type, e) {
		switch (type) {
			case ('click') : {
				trace('click');
			}
			case ('away:click') : {
				trace('away:click');
			}
		}
	}
});