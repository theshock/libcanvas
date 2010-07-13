LibCanvas.Inner.Canvas2D.FpsMeter = new Class({
	fpsMeter : function (frames) {
		var fpsMeter = new LibCanvas.Utils.FpsMeter(frames || 10);
		return this.bind('frameRenderStarted', function () {
			fpsMeter.frame();
		});
	}
});