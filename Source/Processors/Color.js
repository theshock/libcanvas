new function () {

var math = Math;
var round = math.round;

LibCanvas.namespace('Processors').Color = atom.Class({
	rgbToHsb: function(red, green, blue){
		var hue = 0;
		var max = math.max(red, green, blue);
		var delta = max - math.min(red, green, blue);
		var brightness = max / 255, saturation = (max != 0) ? delta / max : 0;
		if(saturation != 0) {
			var rr = (max - red)   / delta;
			var gr = (max - green) / delta;
			var br = (max - blue)  / delta;
			if (red == max) hue = br - gr;
			else if (green == max) hue = 2 + rr - br;
			else hue = 4 + gr - rr;
			hue /= 6;
			if (hue < 0) hue++;
		}
		return [round(hue * 360), round(saturation * 100), round(brightness * 100)];
	},

	hsbToRgb: function(hue, sat, bri){
		bri = round(bri / 100 * 255);
		if (sat == 0) {
			return [br, br, br];
		} else {
			var hue = hue % 360;
			var f = hue % 60;
			var p = round((bri * (100  - sat)) / 10000 * 255);
			var q = round((bri * (6000 - sat * f)) / 600000 * 255);
			var t = round((bri * (6000 - sat * (60 - f))) / 600000 * 255);
			switch (parseInt(hue / 60)){
				case 0: return [bri, t, p];
				case 1: return [q, bri, p];
				case 2: return [p, bri, t];
				case 3: return [p, q, bri];
				case 4: return [t, p, bri];
				case 5: return [bri, p, q];
			}
		}
		return null;
	}
});

}();