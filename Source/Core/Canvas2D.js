/*
---

name: "Canvas2D"

description: "LibCanvas.Canvas2D wraps around native <canvas>."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

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

var Canvas2D = LibCanvas.Canvas2D = Class(
/**
 * @lends LibCanvas.Canvas2D.prototype
 * @augments LibCanvas.prototype
 * @augments FrameRenderer.prototype
 * @augments InnerFpsMeter.prototype
 * @augments DownloadingProgress.prototype
 * @augments Class.Events.prototype
 * @augments Class.Options.prototype
 */
{
	Extends: LibCanvas,
	Implements: [
		FrameRenderer,
		InnerFpsMeter,
		DownloadingProgress,
		Class.Events,
		Class.Options
	],

	Generators: {
		/** @private */
		mouse: function () {
			throw new Error('Mouse is not listened by libcanvas');
		},
		/** @private */
		keyboard: function () {
			throw new Error('Keyboard is not listened by libcanvas');
		},
		/** @private */
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
		/** @private */
		cover: function () {
			if (this.parentLayer) return this.parentLayer.cover;
			return atom.dom
				.create('div')
				.css({
					position: 'absolute',
					width : '100%',
					height: '100%',
					// 1px transparent gif for IE9
					backgroundImage : 'url(data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEAAAEALAAAAAABAAEAAAICTAEAOw==)',
					backgroundRepeat: 'repeat'
				})
				.addClass('libcanvas-layers-cover')
				.appendTo(this.wrapper);
		},
		/** @private */
		invoker: function () {
			return new Invoker({
				context: this,
				defaultPriority: 10,
				fpsLimit: this.options.fps
			});
		}
	},

	/** @deprecated */
	set fps (f) { this.options.fps = f; },
	/** @deprecated */
	get fps ( ) { return this.options.fps; },

	/** @private */
	interval: null,
	/** @private */
	name    : null,

	options: {
		name: 'main',
		autoStart: true,
		clear: true,
		invoke: false, // invoke objects each frame
		fps: 30
	},

	/**
	 * @constructs
	 * @param {atom.dom} elem
	 * @param {object} options
	 * @returns {LibCanvas.Canvas2D}
	 */
	initialize : function (elem, options) {
		Class.bindAll( this, 'update' );

		this._appSize = { width: 0, height: 0 };

		this._shift = new Point( 0, 0 );
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
		this.origElem.atom = aElem;

		this.createProjectBuffer().addClearer();

		var wrapper = this.wrapper, cover = this.cover;

		this.name = this.options.name;
		if (this.parentLayer) {
			this._layers = this.parentLayer._layers;
			aElem.appendTo(wrapper);
		} else {
			this._layers = {};
			aElem
				.replaceWith(wrapper.parent)
				.appendTo(wrapper);

			if (elem.width && elem.height) {
				this.size(elem.width, elem.height, true);
			}
		}

		this._layers[this.name] = this;
		cover.css('zIndex', this.maxZIndex + 100);

		if (this.options.autoStart) this.isReady();
		
		aElem
			.attr('data-layer-name', this.name)
			.css('position', 'absolute');
		this.zIndex = Infinity;

		return this;
	},

	/** @returns {LibCanvas.Canvas2D} */
	show: function () {
		this.origElem.atom.css('display', 'block');
		return this;
	},

	/** @returns {LibCanvas.Canvas2D} */
	hide: function () {
		this.origElem.atom.css('display', 'none');
		return this;
	},

	/**
	 * @param {number} size
	 * @param {number} height
	 * @param {number} wrapper
	 * @returns {LibCanvas.Canvas2D}
	 */
	size: function (size, height, wrapper) {

		if (typeof size == 'object') {
			wrapper = height;
			if (size.width == null) {
				size = { width: size.x, height: size.y };
			}
		} else {
			size = { width: size, height: height };
		}
		for (var i in size) {
			if (this.origElem != this.elem) {
				this.origElem[i] = size[i];
			}
			this.elem[i] = size[i];
		}
		if (wrapper) this.appSize(size);
		return this;
	},

	/**
	 * @param {number} size
	 * @param {number} height
	 * @returns {LibCanvas.Canvas2D}
	 */
	appSize: function (size, height) {
		if (typeof size != 'object') {
			size = { width: size, height: height };
		}
		for (var i in size) {
			this.wrapper       .css(i, size[i]);
			this.wrapper.parent.css(i, size[i]);
			this._appSize[i] = size[i];
		}
		return this;
	},

	/**
	 * @returns {object}
	 */
	getAppSize: function () {
		return this._appSize;
	},

	/**
	 * @deprecated - use `setShift` or `addShift` instead
	 * @param {object} shift
	 * @returns {LibCanvas.Canvas2D}
	 */
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

	/**
	 * @private
	 * @property {LibCanvas.Point}
	 */
	_shift: null,

	/**
	 * @param {LibCanvas.Point} shift
	 * @returns {LibCanvas.Canvas2D}
	 */
	translateMouse: function (shift) {
		shift = Point(shift);
		var elems = this.elems, e, i = elems.length;
		while (i--) {
			e = elems[i];
			if (e.mouseTranslate) {
				e.mouseTranslate.move( shift );
			} else {
				e.mouseTranslate = shift.clone();
			}
		}
		return this;
	},

	/**
	 * @param {LibCanvas.Point} shift
	 * @returns {LibCanvas.Canvas2D}
	 */
	addShift: function ( shift, withElements ) {
		shift = Point( shift );
		var newShift = this._shift.move( shift );
		this.origElem.atom.css({
			'margin-left': newShift.x,
			'margin-top' : newShift.y
		});
		if (withElements) this.translateMouse( shift );
		return this;
	},

	/**
	 * @param {LibCanvas.Point} shift
	 * @returns {LibCanvas.Canvas2D}
	 */
	setShift: function (shift, withElements) {
		return this.addShift( this._shift.diff(shift), withElements );
	},

	/**
	 * @returns {LibCanvas.Point}
	 */
	getShift: function () {
		return this._shift;
	},

	/** @private */
	createProjectBuffer: function () {
		this.elem = this.origElem;
		this.ctx  = this.origCtx;
		return this;
	},

	/** @private */
	addClearer: function () {
		var clear = this.options.clear;
		if (clear) {
			this.addProcessor('pre',
				new Processors.Clearer(
					typeof clear === 'string' ? clear : null
				)
			);
		}
		return this;
	},

	/** @private */
	updateFrame : false,
	/** @returns {LibCanvas.Canvas2D} */
	update : function () {
		this.updateFrame = true;
		return this;
	},
	/** @private */
	_freezed: false,
	/** @returns {LibCanvas.Canvas2D} */
	freeze: function (unfreeze) {
		this._freezed = !unfreeze;
		return this;
	},

	/** @returns {LibCanvas.Canvas2D} */
	listenMouse : function (elem) {
		if (!this._mouse) {
			this._mouse = LibCanvas.isLibCanvas(elem) ?
				elem.mouse : new Mouse(this.wrapper);
		}
		return this;
	},

	/**
	 * @param {string} key
	 * @returns {boolean}
	 */
	getKey : function (key) {
		return this.keyboard.keyState(key);
	},
	/** @returns {LibCanvas.Canvas2D} */
	listenKeyboard : function (elem) {
		if (!this._keyboard) {
			this._keyboard = LibCanvas.isLibCanvas(elem) ? elem.keyboard
				: new Keyboard(/* preventDefault */elem);
		}
		return this;
	},
	/** @returns {HTMLCanvasElement} */
	createBuffer : function (width, height) {
		return Buffer.apply(LibCanvas,
			arguments.length ? arguments :
				Array.collect(this.origElem, ['width', 'height'])
		);
	},
	/** @returns {Shaper} */
	createShaper : function (options) {
		var shaper = new Shaper(this, options);
		this.addElement(shaper);
		return shaper;
	},

	// post-/pre- procesing
	/** @returns {Canvas2D} */
	addProcessor : function (type, processor) {
		this.processors[type].push(processor);
		return this;
	},
	/** @returns {LibCanvas.Canvas2D} */
	rmProcessor : function (type, processor) {
		this.processors[type].erase(processor);
		return this;
	},

	// Element : add, rm
	/** @returns {LibCanvas.Canvas2D} */
	addElement : function (elem) {
		this.elems.include(elem);
		if (elem.libcanvas != this) {
			elem.setLibcanvas(this);
		}
		return this;
	},
	/** @returns {LibCanvas.Canvas2D} */
	rmElement : function (elem) {
		this.elems.erase(elem);
		return this;
	},
	/** @returns {LibCanvas.Canvas2D} */
	rmAllElements: function () {
		this.elems.empty();
		return this;
	},

	// Each frame funcs

	/** @returns {LibCanvas.Canvas2D} */
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
	/** @returns {LibCanvas.Canvas2D} */
	addRender: function (priority, fn) {
		return this.addFunc(priority, fn, true);
	},
	/** @returns {Canvas2D} */
	rmFunc : function (fn) {
		var f = this.funcs;
		f.plain.erase(fn);
		f.render.erase(fn);
		return this;
	},

	stopped: true,

	// Start, pause, stop
	/** @returns {LibCanvas.Canvas2D} */
	start : function (fn) {
		if (!this.stopped) return this;

		this.stopped = false;
		fn && this.addRender(10, fn);
		if (this.invoker.timeoutId == 0) {
			this.invoker
				.addFunction(0, this.renderFrame)
				.addEvent('beforeInvoke', this.fireEvent.bind(this, 'frameRenderStarted' ))
				.addEvent( 'afterInvoke', this.fireEvent.bind(this, 'frameRenderFinished'));
		}
		this.invoker.invoke();
		return this;
	},
	/** @returns {LibCanvas.Canvas2D} */
	stop: function () {
		if (this.stopped) return this;

		this.stopped = true;
		this.invoker.stop();
		return this;
	},

	/** @property {LibCanvas.Canvas2D} */
	parentLayer: null,
	/** @returns {LibCanvas.Canvas2D} */
	layer: function (name) {
		if (!name) {
			// gettin master layer
			return this.parentLayer == null ? this : this.parentLayer.layer();
		}
		
		if (this.layerExists(name)) {
			return this._layers[name];
		} else {
			throw new Error('No layer «' + name + '»');
		}
	},

	/** @returns {boolean} */
	layerExists: function (name) {
		return name in this._layers;
	},

	/** @returns {LibCanvas.Canvas2D} */
	createLayer: function (name, z, options) {
		if (this.layerExists(name)) {
			throw new Error('Layer «' + name + '» already exists');
		}
		if (typeof z == 'object') {
			options = z;
			z = null;
		}
		options = atom.extend({ name: name }, options || {});
		var layer = this._layers[name] = new Layer(this, this.options, options);
		layer._layers = this._layers;
		layer.zIndex  = z;
		layer.origElem.atom.attr({ 'data-layer-name': name });
		return layer;
	},

	/** @returns {LibCanvas.Canvas2D} */
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

	/** @returns {number} */
	get maxZIndex () {
		var top = this.topLayer;
		return top ? top.zIndex : 1;
	},

	/** @private */
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

	/**
	 * not clonable
	 * @returns {LibCanvas.Canvas2D}
	 */
	get clone () {
		return this;
	},
	/** @returns {string} */
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