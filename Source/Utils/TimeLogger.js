/*
---
description: Stop watch

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.TimeLogger]
*/

LibCanvas.namespace('Utils').TimeLogger = atom.Class({
	time : [],
	last : 10,
	sw   : null,
	trace: null,
	initialize : function (last) {
		if (last) this.last = last;
		this.sw    = new LibCanvas.Utils.StopWatch();
		this.trace = new LibCanvas.Utils.Trace();
	},
	from : function () {
		this.sw.start();
		return this;
	},
	to : function (msg) {
		this.time.push(this.sw.getTime(1));
		this.sw.stop();
		if (this.time.length > 25) this.time.shift();
		this.trace.trace(msg + this.time.average().toFixed(2));
	}
});