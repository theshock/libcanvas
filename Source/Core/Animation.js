/*
---

name: "Animation"

description: "Provides basic animation for sprites"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Animation

...
*/

LibCanvas.Animation = atom.Class({
	Implements: [atom.Class.Events],
	sprites : {},
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
	getSprite : function () {
		return this.getFrame() ? this.sprites[this.getFrame().sprite] : 
			this.defaultSprite != null ? this.sprites[this.defaultSprite] : null;
	},

	animations : {},
	add : function (animation) {
		if (!animation.frames && animation.line) {
			animation.frames = [];
			animation.line.forEach(function (f, i) {
				animation.frames.push({sprite: f, delay: animation.delay, name: i});
			});
			delete animation.line;
			return this.add(animation);
		}
		this.animations[animation.name] = animation;
		return this;
	},

	singleAnimationId: 0,
	runOnce: function (cfg) {
		var name = '_singleAnimation' + this.singleAnimationId++;
		return this
			.add(atom.extend({
				name : name,
				delay: 40
			}, cfg))
			.run(name);
	},

	current : null,
	queue : [],
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
		if (this.current) {
			this.queue.push(args);
		} else {
			this.init(args);
		}
		return this;
	},
	stop : function (force) {
		this.current = null;
		if (force) {
			this.queue = [];
		} else {
			this.stopped();
		}
		return this;
	},
	stopped : function () {
		var next = this.queue.shift();
		return next != null && this.init(next);
	},
	init : function (args) {
		this.current = {
			animation : this.animations[args.name],
			index     : -1,
			cfg       : args.cfg
		};
		this.current.repeat = this.getCfg('repeat');
		return this.nextFrame();
	},
	nextFrame : function () {
		if (!this.current) return this;
		
		this.current.index++;
		var frame = this.getFrame();
		if (!frame && (this.getCfg('loop') || this.current.repeat)) {
			this.current.repeat && this.current.repeat--;
			this.current.index = 0;
			frame = this.getFrame();
		}
		var aniName = this.current.animation.name;
		if (frame) {
			var frameName = frame.name ? 'frame:' + frame.name : 'frame';
			this.fireEvent('changed', [frameName, aniName]);
			this.fireEvent(frameName, [frameName, aniName]);
			// use invoker instead
			if (frame.delay != null) this.nextFrame.delay(frame.delay, this);
		} else {
			this.fireEvent('changed', ['stop:' + aniName]);
			this.fireEvent('stop:' + aniName, ['stop:' + aniName]);
			this.fireEvent('stop', [aniName]);
			this.current = null;
			this.stopped();
		}
		return this;
	},
	getFrame : function () {
		return !this.current ? null :
			this.current.animation.frames[this.current.index];
	},
	getCfg : function (index) {
		return index in this.current.cfg ?
			this.current.cfg[index] :
			this.current.animation[index];
	},
	toString: Function.lambda('[object LibCanvas.Animation]')
});
