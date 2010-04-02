
LibCanvas.Canvas2D = new Class({
	initialize : function (elem) {
		this.traceElem  = new LibCanvas.Trace();
		this.interval   = null;
		this.ctx    = elem.getContext('2d-libcanvas');
		this.elems  = [];
		this.images = {};
		this.fps    = 20;
		this.cfg    = {
			autoClear : true,
			autoDraw  : true
		};

		this.mouse = new LibCanvas.Mouse(this);
	},
	setImages  : function (images) {
		this.images = images;
		return this;
	},
	setFps : function (fps) {
		this.fps = fps;
		if (this.interval) {
			this.start(this.fn);
		}
		return this;
	},
	setConfig : function (n) {
		for (var i in n) {
			this.cfg[i] = n[i];
		}
		return this;
	},
	addElement : function (elem) {
		this.checkElem(elem);
		elem.setCanvas(this);
		this.elems = this.elems || [];
		this.elems.push(elem);
		return this;
	},
	checkElem : function (elem) {
		if (!elem instanceof CanvasElem) {
			throw 'Wrong interface, element should instaceof CanvasElem';
		}
		return this;
	},
	drawAll : function () {
		this.elems.each(function () {
			this.draw();
		});
		return this;
	},
	fpsMeter : function (frames) {
		this.fpsMeter = new LibCanvas.FpsMeter(frames);
		return this;
	},
	frame : function () {
		this.ctx.save();

		if (this.cfg.autoClear) {
			this.ctx.clearAll();
		}
		if (this.fpsMeter) {
			this.fpsMeter.frame();
		}
		if (this.fn) {
			this.fn.call(this);
		}
		if (this.cfg.autoDraw) {
			this.drawAll();
		}
		this.ctx.restore();
		return this;
	},
	trace : function () {
		this.traceElem.trace.apply(this.traceElem, arguments);
		return this;
	},
	start : function (fn) {
		this.stop();
		this.fn = fn || this.pauseFn || null;
		this.pauseFn  = undefined;
		this.interval = this.frame.periodical(1000/this.fps, this)
		return this;
	},
	pause : function () {
		this.pauseFn = this.fn;
		return this.stop();
	},
	stop : function () {
		this.fn = undefined;
		this.interval = $clear(this.interval);
		return this;
	}
});