/*
---
description: Constantly calculates frames per seconds rate

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Inner.Canvas2D.FpsMeter]
*/

LibCanvas.namespace('Inner.Canvas2D').FpsMeter = atom.Class({
	fpsMeter : function (frames) {
		var fpsMeter = new LibCanvas.Utils.FpsMeter(frames || (this.fps ? this.fps / 2 : 10));
		return this.bind('frameRenderStarted', function () {
			fpsMeter.frame();
		});
	}
});