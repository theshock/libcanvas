/*
---

name: "App.Behaviors.Clickable"

description: "DEPRECATED"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App.Behaviors

provides: App.Behaviors.Clickable

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

return declare( 'LibCanvas.App.Behaviors.Clickable', App.Behaviors.Behavior, {

	callbacks: {
		'mouseover'   : setValueFn('hover' , true ),
		'mouseout'    : (function () {
			var dehover  = setValueFn('hover' , false),
				deactive = setValueFn('active', false);

			return function (e) {
				dehover .call(this, e);
				deactive.call(this, e);
			};
		})(),
		'mousedown'   : setValueFn('active', true ),
		'mouseup'     : setValueFn('active', false)
	},

	initialize: function (behaviors, args) {
		this.events = behaviors.element.events;
		this.eventArgs(args, 'statusChange');
	},

	start: function () {
		if (!this.changeStatus(true)) return this;

		this.eventArgs(arguments, 'statusChange');
		this.events.add(this.callbacks);
	},

	stop: function () {
		if (!this.changeStatus(false)) return this;

		this.events.remove(this.callbacks);
	}

}).own({ index: 'clickable' });

};