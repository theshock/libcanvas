/*
---

name: "LibCanvas.Processors.Clearer"

description: "Сleans canvas with specified color"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas
- LibCanvas.Context2D

provides: LibCanvas.Processors.Clearer
*/

LibCanvas.namespace('Processors').Clearer = atom.Class({
	style : null,
	initialize : function (style) {
		this.style = style || null;
	},
	process : function (libcanvas) {
		this.style ?
			libcanvas.ctx.fillAll(this.style) :
			libcanvas.ctx.clearAll();
	}
	// processCanvas : function (elem) {}
	// processPixels : function (elem) {}
});