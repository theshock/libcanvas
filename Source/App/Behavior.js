/*
---

name: "App.Behavior"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: App.Behavior

...
*/

/** @class App.Behavior */
var Behavior = declare( 'LibCanvas.App.Behavior', {

	eventName: null,

	initialize: function (element, callback) {
		this.element = element;
		this.events  = element.events;
		this.eventArgs(callback);
	},

	started: false,

	/** @private */
	changeStatus: function (status){
		if (this.started == status) {
			return false;
		} else {
			this.started = status;
			return true;
		}
	},

	/** @private */
	eventArgs: function (callback) {
		if (this.eventName && atom.core.isFunction(callback)) {
			this.events.add( this.eventName, callback );
		}
		return this;
	},

	/** @private */
	getMouse: function (handler, strict) {
		var mouse = this.element.layer.app.resources.get(
			handler ? 'mouseHandler' : 'mouse'
		);

		if (strict && !mouse) {
			throw new Error('No mouse in element');
		}

		return mouse;
	}

});