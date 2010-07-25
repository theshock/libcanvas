LibCanvas.Processors.Clearer = new Class({
	style : null,
	initialize : function (style) {
		this.style = style || null;
	},
	process : function (libcanvas) {
		if (this.style) {
			libcanvas.ctx.fillAll(this.style);
		} else {
			libcanvas.ctx.clearAll();
		}
	}
});