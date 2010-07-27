LibCanvas.Buffer = function (width, height) {
	var a = arguments;
	if (a.length == 1) {
		width  = a[0].width;
		height = a[0].height;
		trace(a.length);
	} else if (!a.length) {
		width  = 0;
		height = 0;
	}
	return new Element("canvas", {
		width  : width,
		height : height
	});
};