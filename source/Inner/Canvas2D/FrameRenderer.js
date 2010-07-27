LibCanvas.Inner.Canvas2D.FrameRenderer = new Class({
	checkAutoDraw : function () {
		if (this.autoUpdate == 'onRequest') {
			if (this.updateFrame) {
				this.updateFrame = false;
				return true;
			}
		} else if (this.autoUpdate) {
			return true;
		}
		return false;
	},
	callFrameFn : function () {
		if (this.fn) {
			this.fn.call(this);
		}
		return this;
	},
	show : function () {
		this.origCtx
			.drawImage({
				image : this.elem,
				from : [0, 0]
			});
		return this;
	},
	drawAll : function () {
		this.elems
			.sortBy('getZIndex', true)
			.each(function (elem) {
				elem.draw();
			});
		return this;
	},
	processing : function (type) {
		this.processors[type].each(function (processor) {
			processor.process(this);
		}.bind(this));
		return this;
	},
	frame : function () {
		this.bind('frameRenderStarted');
		this.renderFrame();
		this.bind('frameRenderFinished');
		return this;
	},
	renderFrame : function () {
		if (this.checkAutoDraw()) {
			this.processing('pre');

			if (this.isReady()) {
				this
					.callFrameFn()
					.drawAll();
			} else {
				this.renderProgress();
			}
			this.processing('post');
			this.show();
		}
		return this;
	}
});