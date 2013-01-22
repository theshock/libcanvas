/*
---

name: "App.Behaviors"

description: "DEPRECATED"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: App.Behaviors

...
*/

/** @class App.Behaviors */
var Behaviors = declare( 'LibCanvas.App.Behaviors', {
	behaviors: {},

	initialize: function (element) {
		this.element   = element;
		this.behaviors = {};
	},

	/** @param [handler=false] */
	getMouse: function (handler) {
		return this.element.layer.app.resources.get(
			handler ? 'mouseHandler' : 'mouse'
		);
	},

	add: function (Behaviour, args) {
		if (typeof Behaviour == 'string') {
			Behaviour = this.constructor[Behaviour];
		}

		return this.behaviors[Behaviour.index] = new Behaviour(this, slice.call( arguments, 1 ));
	},

	get: function (name) {
		return this.behaviors[name] || null;
	},

	startAll: function (arg) {
		this.invoke('start', arguments);
		return this;
	},

	stopAll: function () {
		this.invoke('stop', arguments);
		return this;
	},

	/** @private */
	invoke: function (method, args) {
		var i, b = this.behaviors;
		for (i in b) if (b.hasOwnProperty(i)) {
			b[i][method].apply(b[i], args);
		}
		return this;
	}

}).own({
	attach: function (target, types, arg) {
		target.behaviors = new Behaviors(target);

		types.forEach(function (type) {
			target.behaviors.add(type, arg);
		});

		return target.behaviors;
	}
});


declare( 'LibCanvas.App.Behaviors.Behavior', {
	started: false,

	/** @private */
	eventArgs: function (args, eventName) {
		if (atom.core.isFunction(args[0])) {
			this.events.add( eventName, args[0] );
		}
	},

	/** @private */
	changeStatus: function (status){
		if (this.started == status) {
			return false;
		} else {
			this.started = status;
			return true;
		}
	}
});