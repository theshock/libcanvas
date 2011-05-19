/*
---

name: "Processors.Invert"

description: "Invert all canvas colors"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
	- LibCanvas

provides: Processors.Invert

...
*/

LibCanvas.Processors.Invert = atom.Class({
	processPixels : function (data) {
		var d = data.data, i = 0, l = d.length;
		for (;i < l; i++) if (i % 4 != 3) d[i] = 255 - d[i];
		return data;
	},
	toString: Function.lambda('[object LibCanvas.Processors.Invert]')
});