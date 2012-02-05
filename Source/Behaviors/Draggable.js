/*
---

name: "Behaviors.Draggable"

description: "When object implements LibCanvas.Behaviors.Draggable interface dragging made possible"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors

provides: Behaviors.Draggable

...
*/

declare( 'LibCanvas.Behaviors.Draggable', {

	parent: Behavior,

	own: { index: 'draggable' },

	prototype: {
		stopDrag: [ 'up', 'out' ],

		initialize: function (behaviors, args) {
			this.bindMethods([ 'onStop', 'onDrag', 'onStart' ]);

			this.element = behaviors.element;
			this.events  = behaviors.element.events;
			this.eventArgs(args, 'moveDrag');
		},

		bindMouse: function (method) {
			var mouse = this.element.mouse, stop = this.stopDrag;
			if (!mouse) throw new Error('No mouse in element');

			mouse.events
				[method]( 'move', this.onDrag )
				[method](  stop , this.onStop );

			return mouse;
		},

		start: function () {
			if (!this.changeStatus(true)) return this;

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
			this.element.move( e.deltaOffset );
			this.events.fire('moveDrag', [e.deltaOffset, e]);
		},

		/** @private */
		onStop: function (e) {
			if (e.button !== 0) return;
			this.bindMouse('remove');
			this.events.fire('stopDrag', [ e ]);
		}
	}
});