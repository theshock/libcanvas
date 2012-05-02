/*
 ---

 name: "Animation"

 description: ""

 license:
 - "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
 - "[MIT License](http://opensource.org/licenses/mit-license.php)"

 authors:
 - Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

 provides: Plugins.Animation

 requires:
 - LibCanvas

 ...
 */

/** @class Animation */
var Animation = LibCanvas.declare( 'LibCanvas.Plugins.Animation', 'Animation', {
	currentName : null,
	ownStartTime: null,
	timeoutId   : 0,
	synchronizedWith: null,

	initialize: function (settings) {
		this.bindMethods('update');

		this.events = new atom.Events(this);
		this.settings = new atom.Settings(settings).addEvents(this.events);
		this.run();
	},

	get sheet () {
		return this.settings.get('sheet');
	},

	set sheet (sheet) {
		return this.settings.set('sheet', sheet);
	},

	set startTime (time) {
		this.ownStartTime = time;
	},

	get startTime () {
		if (this.synchronizedWith) {
			return this.synchronizedWith.startTime;
		} else {
			return this.ownStartTime;
		}
	},

	stop: function () {
		this.startTime = null;
		return this.update();
	},

	run: function () {
		this.startTime = Date.now();
		return this.update();
	},

	synchronize: function (anim) {
		this.synchronizedWith = anim;
		return this;
	},

	get: function () {
		return this.sheet.get(this.startTime);
	},

	/** @private */
	update: function () {
		var delay = this.getDelay();

		clearTimeout(this.timeoutId);

		if (delay == null) {
			this.events.fire('stop');
		} else {
			this.events.fire('update', [ this.get() ]);
			this.timeoutId = setTimeout( this.update, delay );
		}
		return this;
	},

	/** @private */
	getDelay: function () {
		return this.startTime == null ? null :
			this.sheet.getCurrentDelay(this.startTime);
	}
});

/** @class Animation.Frames */
atom.declare( 'LibCanvas.Plugins.Animation.Frames', {
	initialize: function (image, width, height) {
		if (image  == null) throw new TypeError('`image` cant be null');

		this.sprites = [];
		this.image   = image;
		this.size    = new Size(
			width  == null ? image.width  : width ,
			height == null ? image.height : height
		);

		this.prepare();
	},

	get length () {
		return this.sprites.length;
	},

	/** @private */
	prepare: function () {
		var x, y,
			im = this.image,
			w  = this.size.width,
			h  = this.size.height;

		for     (y = 0; y <= im.height - h; y += h) {
			for (x = 0; x <= im.width  - w; x += w) {
				this.sprites.push( im.sprite(x, y, w, h) );
			}
		}

		if (!this.sprites.length) {
			throw new TypeError('Animation is empty');
		}
	},

	get: function (id) {
		var sprite = this.sprites[id];

		if (!sprite) {
			throw new Error('No sprite with such id: ' + id);
		}

		return sprite;
	}
});

/** @class Animation.Sheet */
atom.declare( 'LibCanvas.Plugins.Animation.Sheet', {

	initialize: function (options) {
		this.frames   = options.frames;
		this.delay    = options.delay;
		this.looped   = options.looped;
		if (options.sequence == null) {
			this.sequence = atom.array.range(0, this.frames.length - 1);
		} else {
			this.sequence = options.sequence;
		}
	},

	get size () {
		return this.frames.size;
	},

	get: function (startTime) {
		if (startTime == null) return startTime;

		var id = this.getFrameId(this.countFrames(startTime));
		return id == null ? id : this.frames.get( id );
	},

	getCurrentDelay: function (startTime) {
		var frames, switchTime;

		frames = this.countFrames(startTime);

		if (this.getFrameId(frames) == null) {
			return null;
		}

		// когда был включён текущий кадр
		switchTime = frames * this.delay + startTime;

		// до следующего кадра - задержка минус время, которое показывается текущий
		return this.delay - ( Date.now() - switchTime );
	},

	/** @private */
	getFrameId: function (framesCount) {
		if (this.looped) {
			return this.sequence[ framesCount % this.sequence.length ];
		} else if (framesCount >= this.sequence.length) {
			return null;
		} else {
			return this.sequence[framesCount];
		}
	},

	/** @private */
	countFrames: function (startTime) {
		return Math.floor( (Date.now() - startTime) / this.delay );
	}

});

/**
 * @class
 * @name Animation.Image
 * @name LibCanvas.Plugins.Animation.Image
 */
atom.declare( 'LibCanvas.Plugins.Animation.Image', {
	initialize: function (animation) {
		this.bindMethods('update');

		if (animation instanceof Animation.Sheet) {
			animation = { sheet: animation };
		}
		if (!(animation instanceof Animation)) {
			animation = new Animation(animation);
		}

		this.buffer    = LibCanvas.buffer(animation.sheet.size, true);
		this.element   = atom.dom(this.buffer);
		this.animation = animation;
		this.element.controller = this;

		animation.events.add( 'update', this.update );
	},

	update: function (image) {
		this.buffer.ctx.clearAll();
		if (image) this.buffer.ctx.drawImage(image);
	}
}).own({
	element: function (animation) {
		return new this(animation).element;
	}
});