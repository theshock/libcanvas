/*
---
description: LibCanvas.Canvas2D wraps around native <canvas>.

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Inner.Canvas2D.FrameRenderer
- LibCanvas.Inner.Canvas2D.FpsMeter
- LibCanvas.Inner.Canvas2D.DownloadingProgress
- LibCanvas.Behaviors.Bindable

provides: [LibCanvas.Canvas2D]
*/

LibCanvas.Canvas2D = new Class({
	Implements: [
		LibCanvas.Inner.Canvas2D.FrameRenderer,
		LibCanvas.Inner.Canvas2D.FpsMeter,
		LibCanvas.Inner.Canvas2D.DownloadingProgress,
		LibCanvas.Behaviors.Bindable
	],

	fps      : 20,
	autoDraw : true,
	interval : null,

	initialize : function (elem) {
		this.origElem = elem;
		this.origCtx  = elem.getContext('2d-libcanvas');

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
	keyboard: null,
	getKey : function (key) {
		return this.keyboard.keyboard(key);
	},
	listenKeyboard : function (preventDefault) {
		this.keyboard = new LibCanvas.Keyboard(this, preventDefault);
		return this;
	},
	createBuffer : function (width, height) {
		return LibCanvas.Buffer.apply(
			LibCanvas.Buffer, arguments.length ?
				arguments : [this.origElem.width, this.origElem.height]
		);
	},

	// post-/pre- procesing
	processors : { pre: [], post: [] },
	addProcessor : function (type, processor) {
		this.processors[type].push(processor);
		return this;
	},
	rmProcessor : function (type, processor) {
		this.processors[type].erase(processor);
		return this;
	},

	// Element : add, rm
	elems : [],
	addElement : function (elem) {
		this.elems.include(
			elem.setLibcanvas(this)
		);
		return this;
	},
	rmElement : function (elem) {
		this.elems.erase(elem);
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