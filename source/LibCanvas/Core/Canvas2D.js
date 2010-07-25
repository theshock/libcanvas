
LibCanvas.Canvas2D = new Class({
	Implements: [
		LibCanvas.Inner.Canvas2D.FrameRenderer,
		LibCanvas.Inner.Canvas2D.FpsMeter,
		LibCanvas.Inner.Canvas2D.DownloadingProgress,
		LibCanvas.Interfaces.Bindable
	],

	fps      : 20,
	autoDraw : true,

	initialize : function (elem) {
		this.origElem = elem;
		this.origCtx  = elem.getContext('2d-libcanvas');
		this.interval = null;

		this.elem = this.createBuffer();
		this.ctx  = this.elem.getContext('2d-libcanvas');
	},

	updateFrame : true,
	update : function () {
		this.updateFrame = true;
		return this;
	},

	mouse : null,
	listenMouse : function () {
		this.mouse = new LibCanvas.Mouse(this);
		return this;
	},
	createBuffer : function (width, height) {
		return LibCanvas.Buffer.apply(
			LibCanvas.Buffer, arguments.length ?
				arguments : [this.origElem.width, this.origElem.height]
		);
	},


	// Element : add, rm, draw
	elems : [],
	addElement : function (elem) {
		this.elems.include(
			elem.setCanvas(this)
		);
		return this;
	},
	rmElement : function (elem) {
		this.elems.erase(elem);
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

	// Start, pause, stop
	start : function (fn) {
		this.stop();
		this.fn = fn || this.pauseFn || null;
		delete this.pauseFn;
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