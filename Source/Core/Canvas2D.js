/*
---

name: "Canvas2D"

description: "LibCanvas.Canvas2D wraps around native <canvas>."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Context2d
	- Inner.FrameRenderer
	- Inner.FpsMeter
	- Inner.DownloadingProgress

provides: Canvas2D

...
*/

LibCanvas.Canvas2D = atom.Class({
	Extends: LibCanvas,
	Implements: [
		LibCanvas.Inner.FrameRenderer,
		LibCanvas.Inner.FpsMeter,
		LibCanvas.Inner.DownloadingProgress,
		atom.Class.Events,
		atom.Class.Options
	],

	options: {
		clear: null,
		backBuffer: 'on',
		fps: 25,
		autoUpdate: true
	},

	// @deprecated
	set fps (value) {
		this.options.fps = value;
	},
	get fps () {
		return this.options.fps;
	},
	// @deprecated
	set autoUpdate (value) {
		this.options.autoUpdate = value;
	},
	get autoUpdate () {
		return this.options.autoUpdate;
	},
	interval   : null,

	initialize : function (elem, options) {
		if (typeof elem == 'string') elem = atom(elem);
		if (atom.isAtom(elem)) elem = elem.get();

		this.setOptions(options);

		this.origElem = elem;
		this.origCtx  = elem.getContext('2d-libcanvas');

		this.createProjectBuffer().addClearer();

		this.update = this.update.context(this);
	},

	set: function (props) {
		for (var i in props) {
			if (this.origElem != this.elem) {
				this.origElem[i] = props[i];
			}
			this.elem[i] = props[i];
		}
		return this;
	},

	createProjectBuffer: atom.Class.protectedMethod(function () {
		if (this.options.backBuffer == 'off') {
			this.elem = this.origElem;
			this.ctx  = this.origCtx;
		} else {
			this.elem = this.createBuffer();
			this.ctx  = this.elem.getContext('2d-libcanvas');
		}
		return this;
	}),

	addClearer: atom.Class.protectedMethod(function () {
		var clear = this.options.clear;
		if (clear != null) {
			this.addProcessor('pre',
				new LibCanvas.Processors.Clearer(
					typeof clear === 'string' ? clear : null
				)
			);
		}
		return this;
	}),

	updateFrame : true,
	update : function () {
		this.updateFrame = true;
		return this;
	},

	_mouse : null,
	get mouse () {
		if (this._mouse == null) throw new Error('Mouse is not listened by libcanvas');
		return this._mouse;
	},
	listenMouse : function (elem) {
		this._mouse = LibCanvas.isLibCanvas(elem) ? elem.mouse
			: new LibCanvas.Mouse(this, /* preventDefault */elem);
		return this;
	},
	_keyboard : null,
	get keyboard () {
		if (this._keyboard == null) throw new Error('Keyboard is not listened by libcanvas');
		return this._keyboard;
	},
	getKey : function (key) {
		return this.keyboard.keyState(key);
	},
	listenKeyboard : function (elem) {
		this._keyboard = LibCanvas.isLibCanvas(elem) ? elem.keyboard
			: new LibCanvas.Keyboard(this, /* preventDefault */elem);
		return this;
	},
	createBuffer : function (width, height) {
		return LibCanvas.Buffer.apply(LibCanvas,
			arguments.length ? arguments :
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
		this.elems.include(elem.setLibcanvas(this));
		return this;
	},
	rmElement : function (elem) {
		this.elems.erase(elem);
		return this;
	},

	// Each frame funcs
	_invoker: null,
	get invoker () {
		if (this._invoker == null) {
			this._invoker = new LibCanvas.Invoker({
				context: this,
				defaultPriority: 10,
				fpsLimit: this.options.fps
			});
		}
		return this._invoker;
	},


	funcs : [],
	addFunc : function (fn, priority) {
		this.invoker.addFunction(priority, fn);
		return this;
	},
	rmFunc : function (fn) {
		this.invoker.rmFunction(priority, fn);
		return this;
	},

	// Start, pause, stop
	start : function (fn) {
		fn && this.addFunc(fn);
		if (this.invoker.timeoutId == 0) {
			this.addFunc(this.renderFrame, 0);
			this.invoker
				.addEvent('beforeInvoke', this.fireEvent.context(this, ['frameRenderStarted']))
				.addEvent( 'afterInvoke', this.fireEvent.context(this, ['frameRenderFinished']));
		}
		this.invoker.invoke();
		return this;
	},
	stop: function () {
		this.invoker.stop();
		return this;
	},


	// not clonable
	get clone () {
		return this;
	}
});