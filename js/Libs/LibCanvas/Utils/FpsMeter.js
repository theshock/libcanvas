
LibCanvas.Utils.FpsMeter = new Class({
	initialize : function (framesMax) {
		this.trace = new LibCanvas.Utils.Trace();
		this.genTime   = [];
		this.prevTime  = null;
		this.framesMax = framesMax;
	},
	frame : function () {
		if (this.prevTime) {
			var thisTime = $time() - this.prevTime;
			this.genTime.push(thisTime);
			if (this.genTime.length > this.framesMax) {
				this.genTime.shift();
			}
			this.output();
		}
		this.prevTime = $time();
		return this;
	},
	output : function () {
		if (this.genTime.length) {
			var fps = 1000 / this.genTime.average();
			fps = fps.round(fps > 2 ? 0 : fps > 1 ? 1 : 2);
			this.trace.trace('FPS: ' + fps);
		}
		return this;
	}
});