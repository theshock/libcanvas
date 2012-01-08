/*
---

name: "Layer"

description: "Layer"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Canvas2D

provides: Layer

...
*/

var Layer = function () {
	
var callParent = function (method) {
	return function () {
		this.parentLayer[method].apply(this.parentLayer, arguments);
		return this;
	};
};

return declare( 'LibCanvas.Layer',
/**
 * @lends LibCanvas.Layer.prototype
 * @augments LibCanvas.Canvas2D.prototype
 */
{
	parent: Canvas2D,

	proto: {
		initialize : function (elem, parentOptions, options) {
			this.setOptions({});
			this.parentLayer = elem;

			this.settings.set(parentOptions).set(options);

			Canvas2D.prototype.initialize.call(this, elem.createBuffer());
		},

		listenMouse    : callParent('listenMouse'),
		listenKeyboard : callParent('listenKeyboard'),

		start : function () {
			throw new Error('Start can be called only from master layer');
		},
		toString: Function.lambda('[object LibCanvas.Layer]')
	}
});

}();
atom.Class.Mutators.Generators.init(Layer, {
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
});