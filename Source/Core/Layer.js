/*
---

name: "Layer"

description: "Layer"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Canvas2D

provides: Layer

...
*/

new function () {
	
var callParent = function (method) {
	return function () {
		this.parentLayer[method].apply(this.parentLayer, arguments);
		return this;
	};
};

LibCanvas.Layer = atom.Class({
	Extends: LibCanvas.Canvas2D,

	Generators: {
		mouse: function () {
			return this.parentLayer.mouse;
		},
		keyboard: function () {
			return this.parentLayer.keyboard;
		},
		invoker: function () {
			return this.parentLayer.invoker;
		},
		wrapper: function () {
			return this.parentLayer.wrapper;
		}
	},
	
	initialize : function (elem, options) {
		this.parentLayer = elem;
		
		this.parent(elem.createBuffer(), options);
	},

	listenMouse    : callParent('listenMouse'),
	listenKeyboard : callParent('listenKeyboard'),

	start : function () {
		throw new Error('Start can be called only from master layer');
	},
	toString: Function.lambda('[object LibCanvas.Layer]')
});

};