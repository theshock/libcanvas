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

	Generators: {
		mouse: function () {
			throw new Error('Mouse is not listened by libcanvas');
		},
		keyboard: function () {
			throw new Error('Keyboard is not listened by libcanvas');
		},
		wrapper: function () {
			var wrapper = atom.dom.create('div').css({
				width   : '100%',
				height  : '100%',
				overflow: 'hidden',
				position: 'absolute'
			});
			wrapper.parent = atom.dom.create('div').addClass('libcanvas-layers-container');
			return wrapper.appendTo(wrapper.parent);
		},
		// Needs for right mouse behaviour
		cover: function () {
			if (this.parentLayer) return this.parentLayer.cover;
			return atom.dom
				.create('div')
				.css({
					position: 'absolute',
					width : '100%',
					height: '100%'
				})
				.addClass('libcanvas-layers-cover')
				.appendTo(this.wrapper);
		},
		invoker: function () {
			return new LibCanvas.Invoker({
				context: this,
				defaultPriority: 10,
				fpsLimit: this.options.fps
			});
		}
	},

	// @deprecated
	set fps (value) {
		this.options.fps = value;
	},
	get fps () {
		return this.options.fps;
	},
	interval: null,
	name: null,

	options: {
		name: 'main',
		autoStart: true,
		clear: true,
		invoke: false, // invoke objects each frame
		backBuffer: 'off',
		fps: 30
	},

	initialize : function (elem, options) {
		this.funcs = {
			plain : [],
			render: []
		};
		this.elems = [];
		this.processors = { pre: [], post: [] };


		var aElem = atom.dom(elem);
		elem = aElem.first;

		this.setOptions(options);

		this.origElem = elem;
		this.origCtx  = elem.getContext('2d-libcanvas');
		this.origElem.atom = aElem.css('position', 'absolute');

		this.createProjectBuffer().addClearer();

		var wrapper = this.wrapper, cover = this.cover;

		this.name = this.options.name;
		if (this.parentLayer) {
			this._layers = this.parentLayer._layers;
			aElem.appendTo(wrapper);
		} else {
			this._layers = {};
			aElem
				.attr('data-layer-name', this.name)
				.replaceWith(wrapper.parent)
				.appendTo(wrapper);

			if (elem.width && elem.height) {
				this.size(elem.width, elem.height, true);
			}
		}
		this._layers[this.name] = this;
		cover.css('zIndex', this.maxZIndex + 100);

		this.update = this.update.context(this);

		if (this.options.autoStart) this.isReady();

		this.addEvent('ready', function () {
			this.update.delay(0)
		});
		
		this.zIndex = Infinity;
	},
	
	show: function () {
		this.origElem.atom.css('display', 'block');
		return this;
	},
	
	hide: function () {
		this.origElem.atom.css('display', 'hide');
		return this;
	},

	size: function (size, height, wrapper) {
		if (typeof size == 'object') {
			wrapper = height;
		} else {
			size = { width: size, height: height };
		}
		for (var i in size) {
			if (this.origElem != this.elem) {
				this.origElem[i] = size[i];
			}
			this.elem[i] = size[i];
			
			if (wrapper) {
				this.wrapper       .css(i, size[i]);
				this.wrapper.parent.css(i, size[i]);
			}
		}
		return this;
	},
	
	shift: function (shift, left) {
		if (left != null) {
			shift = { top: shift, left: left };
		}
		this.origElem.atom.css({
			'margin-top' : shift.top,
			'margin-left': shift.left
		});
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
		if (!clear) {
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
	_freezed: false,
	freeze: function (unfreeze) {
		this._freezed = !unfreeze;
	},
	listenMouse : function (elem) {
		this._mouse = LibCanvas.isLibCanvas(elem) ? elem.mouse
			: new LibCanvas.Mouse(this, /* preventDefault */elem);
		return this;
	},
	getKey : function (key) {
		return this.keyboard.keyState(key);
	},
	listenKeyboard : function (elem) {
		this._keyboard = LibCanvas.isLibCanvas(elem) ? elem.keyboard
			: new LibCanvas.Keyboard(/* preventDefault */elem);
		return this;
	},
	createBuffer : function (width, height) {
		return LibCanvas.Buffer.apply(LibCanvas,
			arguments.length ? arguments :
				Array.collect(this.origElem, ['width', 'height'])
		);
	},
	createShaper : function (options) {
		var shaper = new LibCanvas.Ui.Shaper(this, options);
		this.addElement(shaper);
		return shaper;
	},

	// post-/pre- procesing
	addProcessor : function (type, processor) {
		this.processors[type].push(processor);
		return this;
	},
	rmProcessor : function (type, processor) {
		this.processors[type].erase(processor);
		return this;
	},

	// Element : add, rm
	addElement : function (elem) {
		this.elems.include(elem);
		elem.setLibcanvas(this);
		return this;
	},
	rmElement : function (elem) {
		this.elems.erase(elem);
		return this;
	},

	// Each frame funcs

	addFunc: function (priority, fn, isRender) {
		if (fn == null) {
			fn = priority;
			priority = fn.priority || 10;
		}
		var f = this.funcs;
		if (!f.plain.contains(fn) && !f.render.contains(fn)) {
			f[isRender ? 'render' : 'plain'].push(fn);
		}
		return this;
	},
	addRender: function (priority, fn) {
		return this.addFunc(priority, fn, true);
	},
	rmFunc : function (fn) {
		var f = this.funcs;
		f.plain.erase(fn);
		f.render.erase(fn);
		return this;
	},

	// Start, pause, stop
	start : function (fn) {
		fn && this.addRender(10, fn);
		if (this.invoker.timeoutId == 0) {
			this.invoker
				.addFunction(0, this.renderFrame)
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

	parentLayer: null,
	layer: function (name) {
		if (!name) {
			// gettin master layer
			return this.parentLayer == null ? this : this.parentLayer.layer();
		}
		
		if (name in this._layers) {
			return this._layers[name];
		} else {
			throw new Error('No layer «' + name + '»');
		}
	},
	
	createLayer: function (name, z, options) {
		if (name in this._layers) {
			throw new Error('Layer «' + name + '» already exists');
		}
		options = atom.extend({ name: name }, options || {});
		var layer = this._layers[name] = new LibCanvas.Layer(this, this.options, options);
		layer._layers = this._layers;
		layer.zIndex  = z;
		layer.origElem.atom.attr({ 'data-layer-name': name });
		return layer;
	},
	
	get topLayer () {
		var max = 0, layers = this._layers, nameMax = null, layer = null;
		for (var name in layers) {
			if (layers[name].zIndex > max) {
				layer = layers[name];
				max   = layer.zIndex;
			}
		}
		return layer;
	},
	
	get maxZIndex () {
		var top = this.topLayer;
		return top ? top.zIndex : 1;
	},
	
	_zIndex: null,
	
	set zIndex (value) {
		var set = function (layer, z) {
			layer._zIndex = z;
			layer.origElem.atom.css('zIndex', z);
			layer.showBuffer();
		};

		if (Object.values(this._layers).length == 1) {
			set(this, 1);
			return;
		}

		var current = this._zIndex;
		
		if (value == null) value = Infinity;
		value = value.limit(1, this.maxZIndex + (current ? 0 : 1));
		current = current || Infinity;
		
		for (var i in this._layers) if (this._layers[i] != this) {
			var l = this._layers[i], z = l._zIndex;
			if (current > z && value <= z) set(l, z+1);
			if (current < z && value >= z) set(l, z-1);
		}
		set(this, value);
	},
	
	get zIndex () {
		return this._zIndex;
	},

	// not clonable
	get clone () {
		return this;
	},
	dump: function () {
		var el = this.elem, 
			pr = [
				'"' + this.name + '"',
				'z=' + this.zIndex,
				'e=' + this.elems.length
			].join(',');
		return '[LibCanvas(' + pr + ')]';
	},
	toString: Function.lambda('[object LibCanvas.Canvas2D]')
});