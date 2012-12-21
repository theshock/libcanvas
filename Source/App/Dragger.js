/*
---

name: "App.Dragger"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App
	- App.LayerShift

provides: App.Dragger

...
*/
/** @class App.Dragger */
declare( 'LibCanvas.App.Dragger', {
	initialize: function (mouse) {
		this.bindMethods([ 'dragStart', 'dragStop', 'dragMove' ]);
		this.events = new Events(this);

		this.mouse  = mouse;
		this.shifts = [];

		this._events = {
			down: this.dragStart,
			up  : this.dragStop,
			out : this.dragStop,
			move: this.dragMove
		};
	},

	addLayerShift: function (shift) {
		this.shifts.push( shift );
		return this;
	},

	started: false,

	start: function (callback) {
		if (callback !== undefined) {
			this.callback = callback;
		}
		this.started = true;
		this.mouse.events.add( this._events );
		return this;
	},

	stop: function () {
		this.started = false;
		this.mouse.events.remove( this._events );
		return this;
	},

	/** @private */
	dragStart: function (e) {
		if (!this.shouldStartDrag(e)) return;

		for (var i = this.shifts.length; i--;) {
			this.shifts[i].layer.stop();
		}
		this.drag = true;
		this.events.fire( 'start', [ e ]);
	},
	/** @private */
	dragStop: function (e) {
		if (!this.drag) return;

		for (var i = this.shifts.length; i--;) {
			var shift = this.shifts[i];
			shift.addElementsShift();
			shift.layer.start();
		}

		this.drag = false;
		this.events.fire( 'stop', [ e ]);
	},
	/** @private */
	dragMove: function (e) {
		if (!this.drag) return;
		for (var i = this.shifts.length; i--;) {
			this.shifts[i].addShift(this.mouse.delta);
		}
	},
	/** @private */
	shouldStartDrag: function (e) {
		if (!this.started) return false;

		return this.callback ? this.callback(e) : true;
	}
});