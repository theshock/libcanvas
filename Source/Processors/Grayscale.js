/*
---

name: "Processors.Grayscale"

description: "Grayscale canvas"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
	- LibCanvas

provides: Processors.Grayscale

...
*/

LibCanvas.namespace('Processors').Grayscale = atom.Class({
	style : null,
	initialize : function (type) {
		// luminance, average, red, green, blue, default
		this.type = type || 'default';
	},
	processPixels : function (data) {
		var i, l, r, g, b,
			d = data.data,
			type = this.type,
			set = function (i, value) {
				d[i] = d[i+1] = d[i+2] = value;
			};

		for (i = 0, l = d.length; i < l; i+=4) {
			r = d[i];
			g = d[i+1];
			b = d[i+2];
			switch (type) {
				case 'luminance': set(i, 0.2126*r + 0.7152*g + 0.0722*b); break;
				case 'average'  : set(i, (r + g + b)/3); break;
				case 'red'      : set(i, r); break;
				case 'green'    : set(i, g); break;
				case 'blue'     : set(i, b); break;
				default : set(i, (3*r + 6*g + b) / 10.); break;
			}
		}
		return data;
	}
});