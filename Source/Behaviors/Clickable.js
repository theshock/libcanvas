/*
---

name: "Behaviors.Clickable"

description: "Provides interface for clickable canvas objects"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors

provides: Behaviors.Clickable

...
*/

new function () {

function setValueFn (name, val) {
	var result = [name, val];
	return function () {
		if (this[name] != val) {
			this[name] = val;
			this.events.fire('statusChange', result);
		}
	};
}

return declare( 'LibCanvas.Behaviors.Clickable', {

	parent: Behavior,

	own: { index: 'clickable' },

	prototype: {
		callbacks: {
			'mouseover'   : setValueFn('hover' , true ),
			'mouseout'    : setValueFn('hover' , false),
			'mousedown'   : setValueFn('active', true ),
			'mouseup'     : setValueFn('active', false),
			'away:mouseup': setValueFn('active', false)
		},

		initialize: function (behaviors, args) {
			this.events = behaviors.element.events;
			this.eventArgs(args, 'statusChange');
		},

		start: function () {
			if (!this.changeStatus(true)) return this;

			this.events.add(this.callbacks);
		},

		stop: function () {
			if (!this.changeStatus(false)) return this;

			this.events.remove(this.callbacks);
		}
	}
});

};