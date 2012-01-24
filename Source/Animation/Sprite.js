/*
---

name: "Animation.Sprite"

description: "Provides basic animation via sprites"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Animation.Sprite

...
*/

LibCanvas.Animation.Sprite = Class({
	Implements: Class.Events,
	sprites : null,

	initialize: function () {
		this.sprites = {};
		this._queue  = [];
		this.animations = {};
	},
	addSprite : function (index, sprite) {
		this.sprites[index] = sprite;
		return this;
	},
	addSprites : function (sprites, width) {
		if (atom.typeOf(sprites) == 'object') {
			atom.extend(this.sprites, sprites);
		} else {
			for (var w = 0; (w * width) < sprites.width; w++) {
				this.addSprite(w, sprites.sprite(width*w, 0, width, sprites.height));
			}
		}
		return this;
	},
	defaultSprite : null,
	setDefaultSprite : function (index) {
		this.defaultSprite = index;
		return this;
	},
	get sprite () {
		return this._getFrame() ? this.sprites[this._getFrame().sprite] :
			this.defaultSprite != null ? this.sprites[this.defaultSprite] : null;
	},
	getSprite : function () {
		return this.sprite;
	},

	animations : {},
	add : function (animation, line) {
		if (arguments.length == 2) {
			return this.add({ name: animation, line: line });
		}

		if (!animation.frames && animation.line) {
			animation.frames = [];
			animation.line.forEach(function (f, i) {
				animation.frames.push({sprite: f, delay: animation.delay || 40, name: i});
			});
			delete animation.line;
			return this.add(animation);
		}
		this.animations[animation.name] = animation;
		return this;
	},

	_singleAnimationId: 0,
	runOnce: function (cfg) {
		var name = '_singleAnimation' + this._singleAnimationId++;
		if (Array.isArray(cfg)) cfg = { line: cfg };

		return this
			.add(atom.extend({ name : name }, cfg))
			.run(name);
	},

	_current : null,
	_queue : [],
	run : function (name, cfg) {
		if (typeof name != 'string') {
			return this.runOnce(name);
		}
		if (!name in this.animations) {
			throw new Error('No animation «' + name + '»');
		}
		var args = {
			name : name,
			cfg  : cfg || {}
		};
		if (this._current) {
			this._queue.push(args);
		} else {
			this._init(args);
		}
		return this;
	},
	stop : function (force) {
		this._current = null;
		if (force) {
			this._queue = [];
		} else {
			this._stopped();
		}
		return this;
	},
	_stopped : function () {
		var next = this._queue.shift();
		return next != null && this._init(next);
	},
	_init : function (args) {
		this._current = {
			animation : this.animations[args.name],
			index     : -1,
			cfg       : args.cfg
		};
		this._current.repeat = this._getCfg('repeat');
		return this._nextFrame();
	},
	_nextFrame : function () {
		if (!this._current) return this;

		this._current.index++;
		var frame = this._getFrame();
		if (!frame && (this._getCfg('loop') || this._current.repeat)) {
			this._current.repeat && this._current.repeat--;
			this._current.index = 0;
			frame = this._getFrame();
		}
		var aniName = this._current.animation.name;
		if (frame) {
			var frameName = frame.name ? 'frame:' + frame.name : 'frame';
			this.fireEvent('changed', [frameName, aniName]);
			this.fireEvent(frameName, [frameName, aniName]);
			// use invoker instead
			if (frame.delay != null) this._nextFrame.delay(frame.delay, this);
		} else {
			this.fireEvent('changed', ['stop:' + aniName]);
			this.fireEvent('stop:' + aniName, ['stop:' + aniName]);
			this.fireEvent('stop', [aniName]);
			this._current = null;
			this._stopped();
		}
		return this;
	},
	_getFrame : function () {
		return this._current ? this._current.animation.frames[this._current.index] : null;
	},
	_getCfg : function (index) {
		return index in this._current.cfg ?
			this._current.cfg[index] :
			this._current.animation[index];
	},
	toString: Function.lambda('[object LibCanvas.Animation.Sprite]')
});
