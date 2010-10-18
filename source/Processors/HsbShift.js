LibCanvas.Processors.HsbShift = new Class({
	shift : 0,
	param : 'hue',
	initialize : function (shift, param) {
		// hue, sat, bri
		this.param = param || 'hue';
		this.shift = shift * 1;
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
			if (['hue', 'sat'].contains(param) && d[i] == d[i+1] && d[i] == d[i+2]) continue;

			hsb = [d[i], d[i+1], d[i+2]].rgbToHsb();
			param == 'hue' ?
				(hsb[0  ] = (hsb[0]   + shift) % 360) :
				(hsb[key] = (hsb[key] + shift).limit(0, 100));
			rgb    = hsb.hsbToRgb();

			d[i  ] = rgb[0];
			d[i+1] = rgb[1];
			d[i+2] = rgb[2];
		}
		return data;
	}
});