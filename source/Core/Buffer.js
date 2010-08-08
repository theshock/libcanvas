/*
---
description: LibCanvas.Context2D provides a buffered canvas interface (e.g. for beforehand rendering).

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Buffer]
*/

LibCanvas.Buffer = function (width, height) {
	var a = arguments;
	if (a.length == 1) {
		width  = a[0].width;
		height = a[0].height;
	} else if (!a.length) {
		width  = 0;
		height = 0;
	}
	return new Element("canvas", {
		width  : width,
		height : height
	});
};