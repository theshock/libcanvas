LibCanvas.Processors.Invert = new Class({
	processPixels : function (data) {
		var d = data.data;
		for (var i = 0; i < d.length; i++) {
			if (i % 4 != 3) d[i] = 255 - d[i];
		}
		return data;
	}
});