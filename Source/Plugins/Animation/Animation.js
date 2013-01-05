/*
---

name: "Plugins.Animation.Core"

description: ""

license:
- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides:
- Plugins.Animation
- Plugins.Animation.Core

requires:
- LibCanvas

...
*/

/** @class Animation */
var Animation = LibCanvas.declare( 'LibCanvas.Plugins.Animation', 'Animation', {
	/** @private */
	ownStartTime: null,
	/** @private */
	timeoutId   : 0,
	/** @private */
	synchronizedWith: null,

	initialize: function (settings) {
		this.bindMethods('update');

		this.events = new atom.Events(this);
		this.settings = new atom.Settings(settings).addEvents(this.events);
		this.run();
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
	get sheet () {
		return this.settings.get('sheet');
	},

	/** @private */
	set sheet (sheet) {
		return this.settings.set('sheet', sheet);
	},

	/** @private */
	set startTime (time) {
		this.ownStartTime = time;
	},

	/** @private */
	get startTime () {
		if (this.synchronizedWith) {
			return this.synchronizedWith.startTime;
		} else {
			return this.ownStartTime;
		}
	},

	/** @private */
	update: function () {
		var delay = this.getDelay();

		clearTimeout(this.timeoutId);

		if (delay == null || this.startTime == null) {
			this.events.fire('stop');
		} else {
			this.timeoutId = setTimeout( this.update, delay );
			this.events.fire('update', [ this.get() ]);
		}
		return this;
	},

	/** @private */
	getDelay: function () {
		return this.startTime == null ? null :
			this.sheet.getCurrentDelay(this.startTime);
	}
});