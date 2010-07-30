/*
---
description: Stopwatch

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.StopWatch]
*/

LibCanvas.Utils.StopWatch = new Class({
	startTime : 0,
	time      : 0,
	traceElem : null,
	initialize : function (autoStart) {
		autoStart && this.start();
	},
	start : function () {
		this.startTime = new Date();
		return this;
	},
	stop : function () {
		this.startTime = 0;
		this.time      = 0;
		return this;
	},
	getTime : function (micro) {
		var d2 = function (num) {
			return num < 10 ? '0' + num : num;
		};

		var t = this.time + (new Date - this.startTime);

		if (micro) {
			return t;
		}
		var s = (t / 1000).round();
		var m = (s / 60).round();
		var h = (m / 60).round();
		if (s < 60) {
			return d2((t / 1000).toFixed(1));
		} else {
			return h + ':' + d2(m) + ':' + d2(s % 60);
		}
	},
	trace : function (micro) {
		if (!this.traceElem) {
			this.traceElem = new LibCanvas.Utils.Trace;
		}
		this.traceElem.trace(this.getTime(micro));
		return this;
	}
});