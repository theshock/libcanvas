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
			return atom().create('div').addClass('libcanvas-layers-container');
		},
		invoker: function () {
			return new LibCanvas.Invoker({
				context: this,
				defaultPriority: 10,
				fpsLimit: this.options.fps
			});
		}
	},

	options: {
		clear: true,
		backBuffer: 'on',
		fps: 30
	},

	// @deprecated
	set fps (value) {
		this.options.fps = value;
	},
	get fps () {
		return this.options.fps;
	},
	// @deprecated
	set autoUpdate (value) { },
	get autoUpdate () { return true; },
	interval   : null,
	name: null,

	initialize : function (elem, options) {
		if (typeof elem == 'string') elem = atom(elem);
		if (atom.isAtom(elem)) elem = elem.get();

		this.setOptions(options);

		if (options.update === false) this.updateFrame = false;

		this.origElem = elem;
		this.origCtx = elem.getContext('2d-libcanvas');
		var aElem = this.origElem.atom = atom(elem)
			.css('position', 'absolute');
		
		if (this.parentLayer) {
			aElem.appendTo(this.wrapper);
		} else {
			this._layers[this.name = 'main'] = this;
			this.zIndex = Infinity;
			aElem
				.attr('data-layer-name', 'main')
				.wrap(this.wrapper.css({
					width : elem.width  + 'px',
					height: elem.height + 'px'
				}));
		}

		this.createProjectBuffer().addClearer();

		this.update = this.update.context(this);

		this.addEvent('ready', function () {
			this.update.delay(0)
		});
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
			wrapper && this.wrapper.css(i, size[i] + 'px');
		}
		return this;
	},
	
	shift: function (shift, left) {
		if (left != null) {
			shift = { top: shift, left: left };
		}
		this.origElem.atom.css({
			'marginTop' : shift.top,
			'marginLeft': shift.left
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
			: new LibCanvas.Keyboard(this, /* preventDefault */elem);
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
		this.elems.include(elem);
		elem.setLibcanvas(this)
		return this;
	},
	rmElement : function (elem) {
		this.elems.erase(elem);
		return this;
	},

	// Each frame funcs

	funcs : {
		plain : [],
		render: []
	},
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

	_layers: {},
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
	
	createLayer: function (name, z) {
		if (name in this._layers) {
			throw new Error('Layer «' + name + '» already exists');
		}
		var layer = this._layers[name] = new LibCanvas.Layer(this, this.options);
		layer._layers = this._layers;
		layer.zIndex  = z;
		layer.name    = name;
		layer.origElem.atom.attr({ 'data-layer-name': name });
		return layer;
	},
	
	get topLayer () {
		var max = 0, layers = this._layers, nameMax = null;
		for (var name in layers) if (layers[name].zIndex > max) {
			nameMax = name;
			max     = layers[name].zIndex;
		}
		return layers[nameMax] || null;
	},
	
	get maxZIndex () {
		var top = this.topLayer;
		return top ? top.zIndex : 0;
	},
	
	_zIndex: null,
	
	set zIndex (z) {
		var cur = this._zIndex, layers = this._layers, name;
		if (z == null || z == Infinity) {
			z = 1;
			// ищем самый большой z-index и присваиваем текущему элементу на единицу больше
			for (name in layers) {
				var thatZ = layers[name].zIndex;	
				if (thatZ && thatZ >= z) z = thatZ;
			}
			if (cur == null) z++;
		}
		z = z.limit(1, this.maxZIndex + 1);
		if (cur != null) {
			for (name in layers) {
				if (layers[name] != this) {
					var lz = layers[name].zIndex;
					if (z < cur) { // zIndex уменьшается
						if (z <= lz && lz < cur) layers[name]._zIndex++;
					} else { // zIndex увеличивается
						if (cur < lz && lz <= z) layers[name]._zIndex--;
					}
				}
			}
		}
		this.origElem.atom.css('zIndex', z);
		this._zIndex = z;
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