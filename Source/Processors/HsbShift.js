/*
---

name: "Processors.HsbShift"

description: "Shift on of hue|saturation|bright value of all colors"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
	- LibCanvas
	- Processors.Color

provides: Processors.HsbShift

...
*/


LibCanvas.Processors.HsbShift = atom.Class({
	Extends: LibCanvas.Processors.Color,
	shift : 0,
	param : 'hue',
	initialize : function (shift, param) {
		// hue, sat, bri
		this.param =    param || this.param;
		this.shift = 1*(shift || this.shift);
		if (this.param == 'hue') {
			this.shift %= 360;
			if (this.shift < 0) this.shift += 360;
		} else {
			this.shift = this.shift.limit(-100, 100);
		}
	},
	processPixels : function (data) {
		var d = data.data,
			shift = this.shift,
			param = this.param,
			key   = { hue: 0, sat: 1, bri: 2 }[param],
			i, hsb, rgb;
		for (i = 0; i < d.length; i+=4) {
			if ((param == 'hue' || param == 'sat') && d[i] == d[i+1] && d[i] == d[i+2]) continue;

			hsb = this.rgbToHsb(d[i], d[i+1], d[i+2]);
			param == 'hue' ?
				(hsb[0  ] = (hsb[0]   + shift) % 360) :
				(hsb[key] = (hsb[key] + shift).limit(0, 100));
			rgb = this.hsbToRgb(hsb[0], hsb[1], hsb[2]);

			d[i  ] = rgb[0];
			d[i+1] = rgb[1];
			d[i+2] = rgb[2];
		}
		return data;
	},
	toString: Function.lambda('[object LibCanvas.Processors.HsbShift]')
});