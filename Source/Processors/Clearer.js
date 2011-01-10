/*
---
description: Every frame cleans canvas with specified color

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Processors.Clearer]
*/  

LibCanvas.namespace('Processors').Clearer = atom.Class({
	style : null,
	initialize : function (style) {
		this.style = style || null;
	},
	process : function (libcanvas) {
		this.style ?
			libcanvas.ctx.fillAll(this.style) :
			libcanvas.ctx.clearAll();
	}
	// processCanvas : function (elem) {}
	// processPixels : function (elem) {}
});