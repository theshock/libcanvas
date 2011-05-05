/*
---

name: "Utils.StopWatch"

description: "StopWatch"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Utils.StopWatch

...
*/

LibCanvas.namespace('Utils').StopWatch = atom.Class({
	startTime : 0,
	initialize : function (autoStart) {
		autoStart && this.start();
	},
	start : function () {
		this.startTime = Date.now();
		return this;
	},
	stop : function () {
		this.startTime = 0;
		return this;
	},
	getTime : function (micro) {
		var d2 = function (num) { return num < 10 ? '0' + num : num; };

		var t = Date.now() - this.startTime;

		if (micro) return t;
		var s = (t / 1000).round(), m = (s / 60).round(), h = (m / 60).round();
		return (s < 60) ?
			d2((t / 1000).toFixed(1)) :
			h + ':' + d2(m) + ':' + d2(s % 60);
	},
	toString: Function.lambda('[object LibCanvas.Utils.StopWatch]')
});