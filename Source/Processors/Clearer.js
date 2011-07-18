/*
---

name: "Processors.Clearer"

description: "Сleans canvas with specified color"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
	- LibCanvas
	- Context2D

provides: Processors.Clearer

...
*/

LibCanvas.Processors.Clearer = atom.Class({
	style : null,
	initialize : function (style) {
		this.style = style || null;
	},
	process : function (libcanvas) {
		this.style ?
			libcanvas.ctx.fillAll(this.style) :
			libcanvas.ctx.clearAll();
	},
	toString: Function.lambda('[object LibCanvas.Processors.Clearer]')
	// processCanvas : function (elem) {}
	// processPixels : function (elem) {}
});