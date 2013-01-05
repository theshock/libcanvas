/*
---

name: "Plugins.Animation.Sheet"

description: ""

license:
- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides:
- Plugins.Animation
- Plugins.Animation.Sheet

requires:
- LibCanvas
- Plugins.Animation.Core

...
*/

/** @class Animation.Sheet */
atom.declare( 'LibCanvas.Plugins.Animation.Sheet', {

	initialize: function (options) {
		this.frames = options.frames;
		this.delay  = options.delay;
		this.looped = options.looped;
		if (options.sequence == null) {
			this.sequence = atom.array.range(0, this.frames.length - 1);
		} else {
			this.sequence = options.sequence;
		}
	},

	/** @private */
	get size () {
		return this.frames.size;
	},

	/** @private */
	get: function (startTime) {
		if (startTime == null) return null;

		var id = this.getFrameId(this.countFrames(startTime));
		return id == null ? id : this.frames.get( id );
	},

	/** @private */
	getCurrentDelay: function (startTime) {
		var frames, switchTime;

		frames = this.countFrames(startTime);

		if (this.getFrameId(frames) == null) {
			return null;
		}

		// когда был включён текущий кадр
		switchTime = frames * this.delay + startTime;

		// до следующего кадра - задержка минус время, которое уже показывается текущий
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