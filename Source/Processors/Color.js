/*
---

name: "Processors.Color"

description: "Abstract class for works with color"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
	- LibCanvas

provides: Processors.Color

...
*/

new function () {

var math = Math;

LibCanvas.namespace('Processors').Color = atom.Class({
	rgbToHsb: function(red, green, blue){
		var hue = 0,
			max = math.max(red, green, blue),
			delta = max - math.min(red, green, blue),
			brightness = max / 255,
			saturation = (max != 0) ? delta / max : 0;
		if (saturation) {
			var rr = (max - red)   / delta,
			    gr = (max - green) / delta,
			    br = (max - blue)  / delta;
			     if (red   == max) hue = br - gr;
			else if (green == max) hue = 2 + rr - br;
			else                   hue = 4 + gr - rr;
			hue /= 6;
			
			if (hue < 0) hue++;
		}
		return [math.round(hue * 360), math.round(saturation * 100), math.round(brightness * 100)];
	},

	hsbToRgb: function(hue, sat, bri){
		bri = math.round(bri / 100 * 255);
		if (!sat) return [bri, bri, bri];
		hue = hue % 360;
		
		var f = hue % 60,
			p = math.round((bri * (100  - sat)) / 10000 * 255),
			q = math.round((bri * (6000 - sat * f)) / 600000 * 255),
			t = math.round((bri * (6000 - sat * (60 - f))) / 600000 * 255);
		switch (parseInt(hue / 60)){
			case 0: return [bri, t, p];
			case 1: return [q, bri, p];
			case 2: return [p, bri, t];
			case 3: return [p, q, bri];
			case 4: return [t, p, bri];
			case 5: return [bri, p, q];
		}
		return null;
	},
	toString: Function.lambda('[object LibCanvas.Processors.Color]')
});

}();