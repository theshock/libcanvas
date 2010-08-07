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
		var prevent = function (key) {
			return preventDefault && (
				 $type(preventDefault) != 'array' ||
				($type(preventDefault) == 'array' && preventDefault.contains(key))
			);
		};

		var keyEvent = (function (setTo) {
			return function (evt, ctx) {
				keyStates[evt.key] = setTo;
				if (setTo == true && bindings) {
					if (!bindings[evt.key]) {
						return !prevent(evt.key);
					}
					bindings[evt.key].each(function (keyBind, i) {
						if (keyBind[0] == evt.key) {
							keyBind[1]();
						}
					});
				}
				return !prevent(evt.key);
			}.bind(this);
		}.bind(this));

		// Input
		window.addEvent('keydown', keyEvent(true));
		window.addEvent('keyup',   keyEvent(false));

		preventDefault && window.addEvent('keypress', function (evt) {
			return !prevent(evt.key);
		});
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
