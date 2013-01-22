/*
---

name: "App.Draggable"

description: "When object implements LibCanvas.Draggable interface dragging made possible"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App.Behavior

provides: App.Draggable

...
*/

/** @class App.Draggable */
declare( 'LibCanvas.App.Draggable', App.Behavior, {

	eventName: 'moveDrag',

	stopDrag: [ 'up', 'out' ],

	initialize: function method (element, callback) {
		this.bindMethods([ 'onStop', 'onDrag', 'onStart' ]);

		method.previous.call( this, element, callback );
	},

	start: function (callback) {
		if (this.changeStatus(true)) {
			this.mouse = this.getMouse(false, true);
			this.eventArgs(callback);
			this.events.add( 'mousedown', this.onStart )
		}
		return this;
	},

	stop: function () {
		if (this.changeStatus(false)) {
			this.events.remove( 'mousedown', this.onStart );
		}
		return this;
	},

	/** @private */
	bindMouse: function (method) {
		var mouse = this.mouse, stop = this.stopDrag;

		mouse.events
			[method]( 'move', this.onDrag )
			[method](  stop , this.onStop );

		return mouse;
	},

	/** @private */
	onStart: function (e) {
		if (e.button !== 0) return;

		this.bindMouse('add');
		this.events.fire('startDrag', [ e ]);
	},

	/** @private */
	onDrag: function (e) {
		if (!this.element.layer) {
			return this.onStop(e, true);
		}

		var delta = this.mouse.delta;
		this.element.distanceMove( delta );
		this.events.fire('moveDrag', [delta, e]);
	},

	/** @private */
	onStop: function (e, forced) {
		if (e.button === 0 || forced === true) {
			this.bindMouse('remove');
			this.events.fire('stopDrag', [ e ]);
		}
	}
});