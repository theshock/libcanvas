/*
---

name: "App.Behaviors.Draggable"

description: "DEPRECATED"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App.Behaviors

provides: App.Behaviors.Draggable

...
*/

declare( 'LibCanvas.App.Behaviors.Draggable', App.Behaviors.Behavior, {
	stopDrag: [ 'up', 'out' ],

	initialize: function (behaviors, args) {
		this.bindMethods([ 'onStop', 'onDrag', 'onStart' ]);

		this.behaviors = behaviors;
		this.element   = behaviors.element;
		if (!atom.core.isFunction(this.element.move)) {
			throw new TypeError( 'Element ' + this.element + ' must has «move» method' );
		}
		this.events  = behaviors.element.events;
		this.eventArgs(args, 'moveDrag');
	},

	bindMouse: function (method) {
		var mouse = this.mouse, stop = this.stopDrag;

		mouse.events
			[method]( 'move', this.onDrag )
			[method](  stop , this.onStop );

		return mouse;
	},

	start: function () {
		if (!this.changeStatus(true)) return this;

		this.mouse = this.behaviors.getMouse();
		if (!this.mouse) throw new Error('No mouse in element');
		this.eventArgs(arguments, 'moveDrag');
		this.events.add( 'mousedown', this.onStart );
	},

	stop: function () {
		if (!this.changeStatus(false)) return this;

		this.events.remove( 'mousedown', this.onStart );
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

		var delta = this.behaviors.getMouse().delta;
		this.element.move( delta );
		this.events.fire('moveDrag', [delta, e]);
	},

	/** @private */
	onStop: function (e, forced) {
		if (e.button === 0 || forced === true) {
			this.bindMouse('remove');
			this.events.fire('stopDrag', [ e ]);
		}
	}
}).own({ index: 'draggable' });