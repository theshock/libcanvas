/*
---
description: Constantly calculates frames per seconds rate

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Inner.Canvas2D.FpsMeter]
*/

LibCanvas.Inner.Canvas2D.FpsMeter = new Class({
	fpsMeter : function (frames) {
		var fpsMeter = new LibCanvas.Utils.FpsMeter(frames || 10);
		return this.bind('frameRenderStarted', function () {
			fpsMeter.frame();
		});
	}
});