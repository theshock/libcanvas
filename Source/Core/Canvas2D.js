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

LibCanvas.Canvas2D = atom.Class({
	Extends: LibCanvas,
	Implements: [
		LibCanvas.Inner.Canvas2D.FrameRenderer,
		LibCanvas.Inner.Canvas2D.FpsMeter,
		LibCanvas.Inner.Canvas2D.DownloadingProgress,
		LibCanvas.Behaviors.Bindable
	],

	fps        : 1,
	autoUpdate : true,
	interval   : null,

	initialize : function (elem, cfg) {
		if (typeof elem == 'string') elem = atom(elem);
		if (atom.isAtom(elem)) elem = elem.get();

		this.origElem = elem;
		this.origCtx  = elem.getContext('2d-libcanvas');

		if (cfg && cfg.backBuffer == 'off') {
			this.elem = this.origElem;
			this.ctx  = this.origCtx;
		} else {
			this.elem = this.createBuffer();
			this.ctx  = this.elem.getContext('2d-libcanvas');
		}

		this.update = this.update.context(this);
	},

	updateFrame : true,
	update : function () {
		if (this.autoUpdate == 'onRequest') {
			this.updateFrame = true;
		} else {
			this.frame();
		}
		return this;
	},

	mouse : null,
	listenMouse : function (elem) {
		this.mouse = LibCanvas.isLibCanvas(elem) ? elem.mouse
			: new LibCanvas.Mouse(this, /* preventDefault */elem);
		return this;
	},
	keyboard: null,
	getKey : function (key) {
		return this.keyboard.keyState(key);
	},
	listenKeyboard : function (elem) {
		this.keyboard = LibCanvas.isLibCanvas(elem) ? elem.keyboard
			: new LibCanvas.Keyboard(this, /* preventDefault */elem);
		return this;
	},
	createBuffer : function (width, height) {
		return LibCanvas.Buffer.apply(
			LibCanvas, arguments.length ? arguments :
				Array.collect(this.origElem, ['width', 'height'])
		);
	},
	createGrip : function (config) {
		var grip = new LibCanvas.Ui.Grip(this, config);
		this.addElement(grip);
		return grip;
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

	// Each frame funcs
	funcs : [],
	addFunc : function (fn, priority) {
		fn.priority = priority || 10;
		this.funcs.include(fn);
		return this;
	},
	rmFunc : function (fn) {
		this.funcs.erase(fn);
		return this;
	},

	// Start, pause, stop
	start : function (fn) {
		this.fn = fn;
		this.frame();
		return this;
	}
});