
LibCanvas.clone = function (o) {
	if(!o || "object" !== typeof o)  {
		return o;
	}
	var c = is.array(o) ? [] : {};
	for(var p in o) {
		if (o.hasOwnProperty(p)) {
			var v = o[p];
			c[p] = (v && "object" === typeof v) ?
				arguments.callee(v) : v;
		}
	}
	return c;
};