/*
---

name: "App.Clickable"

description: "Provides interface for clickable canvas objects"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App.Behavior

provides: App.Clickable

...
*/

/** @class App.Clickable */
var Clickable = declare( 'LibCanvas.App.Clickable', App.Behavior, {

	eventName: 'statusChange',

	callbacks: {
		mousedown: function (e) {
			Clickable.setValue(this, 'active', true , e);
		},
		mouseup  : function (e) {
			Clickable.setValue(this, 'active', false, e);
		},
		mouseover: function (e) {
			Clickable.setValue(this, 'hover' , true , e);
		},
		mouseout : function (e) {
			Clickable.setValue(this, 'hover' , false, e);
			Clickable.setValue(this, 'active', false, e);
		}
	},

	start: function (callback) {
		if (this.changeStatus(true)) {
			this.eventArgs(callback);
			this.events.add(this.callbacks);
		}
		return this;
	},

	stop: function () {
		if (this.changeStatus(false)) {
			this.events.remove(this.callbacks);
		}
		return this;
	}

});

Clickable.setValue = function (element, name, val, event) {
	if (element[name] != val) {
		element[name] = val;
		element.events.fire(
			Clickable.prototype.eventName,
			[name, val, event]
		);
	}
};