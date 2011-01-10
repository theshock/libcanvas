/*
---
description: Private class for inner usage in LibCanvas.Canvas2D

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Inner.Canvas2D.FrameRenderer]
*/

LibCanvas.namespace('Inner.Canvas2D').FrameRenderer = atom.Class({
	checkAutoDraw : function () {
		if (this.autoUpdate == 'onRequest') {
			if (this.updateFrame) {
				this.updateFrame = false;
				return true;
			}
		} else if (this.autoUpdate) return true;
		return false;
	},
	callFrameFn : function () {
		if (this.fn) this.fn.call(this);
		return this;
	},
	show : function () {
		this.origCtx.clearAll().drawImage(this.elem);
		return this;
	},
	drawAll : function () {
		var elems = this.elems.sortBy('getZIndex');
		for (var i = elems.length; i--;) elems[i].draw();
		return this;
	},
	processing : function (type) {
		this.processors[type].forEach(function (processor) {
			if ('process' in processor) {
				processor.process(this);
			} else if ('processCanvas' in processor) {
				processor.processCanvas(this.elem);
			} else if ('processPixels' in processor) {
				this.ctx.putImageData(
					processor.processCanvas(
						this.ctx.getImageData()
					)
				);
			}
		}.context(this));
		return this;
	},
	nextFrame : function (time) {
		this.nft || (this.nft = new LibCanvas.Utils.Trace());

		time = Math.max(time, 1000 / this.fps);

		this.nft.trace((1000 / time).round());
		this.frame.bind(this, time).delay(184);
	},
	frameTime : [0],
	frame : function (time) {
		this.nextFrame(this.frameTime.average());

		var startTime = Date.now();
			this.bind('frameRenderStarted');
			this.funcs
				.sortBy('priority', true)
				.invoke(this, time);
			var render = this.renderFrame();
			this.bind('frameRenderFinished');
		var lastFrameTime = Date.now() - startTime;

		// if no render in this frame - take last rendered frame time
		if (render) {
			this.frameTime.push(lastFrameTime);
			if (this.frameTime.length > 10) {
				this.frameTime.shift();
			}
		}
		return this;
	},
	renderFrame : function () {
		if (this.checkAutoDraw()) {
			this.processing('pre');

			this.isReady() ?
				this.callFrameFn().drawAll() :
				this.renderProgress();
			this.processing('post');
			if (this.elem != this.origElem) this.show();
			return true;
		}
		return false;
	}
});