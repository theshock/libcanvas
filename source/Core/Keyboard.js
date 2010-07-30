/*
---
description: A keyboard control abstraction class

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Mouse]
*/

(function () {

var keyStates = {};
var bindings  = {};

LibCanvas.Keyboard = new Class({
	initialize : function (canvas, preventDefault) {
		var keyEvent = (function (setTo) {
			return function (evt, ctx) {
				keyStates[evt.key] = setTo;
				if (setTo == true && bindings) {
					if (!bindings[evt.key]) {
						return;
					}
					bindings[evt.key].each(function (keyBind, i) {
						if (keyBind[0] == evt.key) {
							keyBind[1]();
						}
					});
				}
			}.bind(this);
		}.bind(this));

		// Input
		window.addEvent('keydown', keyEvent(true));
		window.addEvent('keyup',   keyEvent(false));

		if (preventDefault) {
			window.addEvent('keydown',  $lambda(false));
			window.addEvent('keypress', $lambda(false));
			window.addEvent('keyup',    $lambda(false));
		}
	},
	keyboard : function (keyName) {
		if (keyStates[keyName]) {
			return true;
		}
		return false;
	},
	bind : function (keyName, fn) {
		bindings[keyName] = bindings[keyName] || [];
		return bindings[keyName].push([keyName, fn]);
	},
	unbind : function (key, fn) {
		bindings[key].erase([key, fn]);
	}
});

})();
