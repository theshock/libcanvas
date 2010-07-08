LibCanvas.Utils.StopWatch = new Class({
	Implements : [LibCanvas.Interfaces.Bindable],
	time : 0,
	interval : null,
	initialize : function (autoStart) {
		if (autoStart) {
			this.start();
		}
	},
	start : function () {
		this.bind('started');
		this.interval = function () {
			this.time++;
			this.bind('change');
		}.bind(this).periodical(100);
		return this;
	},
	pause : function (restartIn) {
		this.bind('paused');
		$clear(this.interval);
		if (restartIn) {
			this.start.bind(this).delay(1000 * restartIn);
		}
		return this;
	},
	stop : function () {
		this.bind('stopped');
		this.pause();
		this.time = 0;
		return this;
	},
	getTime : function () {
		var ms, s, m, h, t = this.time;
		var round = Math.round;
		if (this.time < 600) {
			return (t / 10).toFixed(1);
		} else {
			m = t / 600;
			h = round(m / 60);
			m = (m % 60).toFixed(1);
			return h ? h+':'+m : m;
		}
	}
});