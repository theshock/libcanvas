/*
---

name: "Utils.TimeLogger"

description: "TimeLogger"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Utils.StopWatch
	- Utils.Trace

provides: Utils.TimeLogger

...
*/
new function () {

var Utils = LibCanvas.Utils;

LibCanvas.namespace('Utils').TimeLogger = atom.Class({
	time : [],
	last : 10,
	sw   : null,
	trace: null,
	initialize : function (last) {
		if (last) this.last = last;
		this.sw    = new Utils.StopWatch();
		this.trace = new Utils.Trace();
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
	},
	toString: Function.lambda('[object LibCanvas.Utils.TimeLogger]')
});

}();