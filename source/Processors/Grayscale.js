/*
---
description: Every frame cleans canvas with specified color

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Processors.Grayscale]
*/

LibCanvas.Processors.Grayscale = new Class({
	style : null,
	initialize : function (type) {
		// luminance, average, red, green, blue, default
		this.type = type || 'default';
	},
	processPixels : function (data) {
		var d = data.data;
		var set = function (i, value) {
			d[i] = d[i+1] = d[i+2] = value;
		};
		var type = this.type;
		for (var i = 0; i < d.length; i+=4) {
			var r = d[i];
			var g = d[i+1];
			var b = d[i+2];
			switch (type) {
				case 'luminance': set(i, 0.2126*r + 0.7152*g + 0.0722*b); break;
				case 'average'  : set(i, (r + g + b)/3); break;
				case 'red'      : set(i, r); break;
				case 'green'    : set(i, g); break;
				case 'blue'     : set(i, b); break;
				default : set(i, 0.3*r + 0.59*g + 0.11*b); break;
			}
		}
		return data;
	}
});