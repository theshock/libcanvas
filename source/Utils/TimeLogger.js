/*
---
description: Stop watch

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.TimeLogger]
*/

LibCanvas.Utils.TimeLogger = new Class({
	time : [],
	last : 0,
	sw   : null,
	trace: null,
	initialize : function (last) {
		this.last  = last | 10;
		this.sw    = new LibCanvas.Utils.StopWatch();
		this.trace = new LibCanvas.Utils.Trace();
	},
	from : function () {
		this.sw.start();
		return this;
	},
	to   : function (msg) {
		this.time.push(this.sw.getTime(1));
		this.sw.stop();
		if (this.time.length > 25) {
			this.time.shift();
		}
		this.trace.trace(msg + this.time.average().toFixed(2));
		return;
	}
});