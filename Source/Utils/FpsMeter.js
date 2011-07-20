/*
---

name: "Utils.FpsMeter"

description: "Provides FPS indicator"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Utils.Trace

provides: Utils.FpsMeter

...
*/

var FpsMeter = LibCanvas.Utils.FpsMeter = Class({
	initialize : function (framesMax) {
		this.trace = new Trace();
		this.genTime   = [];
		this.prevTime  = null;
		this.framesMax = framesMax;
	},
	frame : function () {
		if (this.prevTime) {
			this.genTime.push(Date.now() - this.prevTime);
			if (this.genTime.length > this.framesMax) {
				this.genTime.shift();
			}
		}
		this.output();
		this.prevTime = Date.now();
		return this;
	},
	output : function () {
		if (this.genTime.length) {
			var fps = 1000 / this.genTime.average();
			fps = fps.round(fps > 2 ? 0 : fps > 1 ? 1 : 2);
			this.trace.trace('FPS: ' + fps);
		} else {
			this.trace.trace('FPS: counting');
		}
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Utils.FpsMeter]')
});