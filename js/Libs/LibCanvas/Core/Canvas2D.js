
LibCanvas.Canvas2D = new Class({
	initialize : function (elem) {
		this.traceElem  = new LibCanvas.Utils.Trace();
		this.interval   = null;
		this.ctx    = elem.getContext('2d-libcanvas');
		this.elems  = [];
		this.fps    = 20;
		this.images = {};
		this.cfg    = {
			autoClear   : true,
			autoDraw    : true,
			background  : false,
			images      : null,
			progressBar : null
		};

		this.progressBar = null;
		this.mouse = null;
	},
	getImage : function (name) {
		if (this.images[name]) {
			return this.images[name];
		} else {
			throw 'No image "' + name + '"';
		}
	},
	setFps : function (fps) {
		this.fps = fps;
		if (this.interval) {
			this.start(this.fn);
		}
		return this;
	},
	config : function (n) {
		for (var i in n) {
			if (i == 'fps') {
				this.setFps(n[i]);
			} else if (i == 'fpsMeter') {
				this.fpsMeter(n[i]);
			} else {
				this.cfg[i] = n[i];
			}
		}
		return this;
	},
	addElement : function (elem) {
		this.checkElem(elem);
		elem.setCanvas(this);
		this.elems = this.elems || [];
		this.elems.include(elem);
		return this;
	},
	rmElement : function (elem) {
		(this.elems || []).erase(elem);
		return this;
	},
	checkElem : function (elem) {
		if (typeof elem.setCanvas != 'function') {
			throw 'No setCanvas method';
		}
		return this;
	},
	listenMouse : function () {
		this.mouse = new LibCanvas.Mouse(this);
		return this;
	},
	drawAll : function () {
		this.elems
			.sortByZIndex(true)
			.each(function (elem) {
				elem.draw();
			});
		return this;
	},
	fpsMeter : function (frames) {
		this.fpsMeter = new LibCanvas.Utils.FpsMeter(frames);
		return this;
	},
	frame : function () {
		if (this.fpsMeter) {
			this.fpsMeter.frame();
		}

		if (!this.cfg.images || (this.imagePreloader && this.imagePreloader.isReady())) {
			if (this.progressBar) {
				this.rmElement(this.progressBar);
				this.progressBar = null;
			}

			this.ctx.save();
			if (this.cfg.autoClear) {
				this.ctx.clearAll();
			}
			if (this.cfg.background) {
				this.ctx.fillAll(this.cfg.background);
			}
			if (this.fn) {
				this.fn.call(this);
			}
			if (this.cfg.autoDraw) {
				this.drawAll();
			}
			this.ctx.restore();
		} else {
			if (!this.imagePreloader) {
				this.imagePreloader = new LibCanvas.Utils.ImagePreloader(this.cfg.images)
					.ready(function (preloader) {
						this.images = preloader.images;
						log(preloader.getInfo());
					}.bind(this));
			}
			if (this.cfg.progressBar && !this.progressBar) {
				this.progressBar = new LibCanvas.Utils.ProgressBar()
					.setStyle(this.cfg.progressBar)
				this.addElement(this.progressBar);
			}
			if (this.progressBar) {
				this.progressBar
					.setProgress(this.imagePreloader.getProgress())
					.draw();
			}
		}
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