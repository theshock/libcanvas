/*
---
description: Basic abstract class for animatable objects.

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Animatable]
*/

LibCanvas.Behaviors.Animatable = new Class({
	animate : function (args) {
		var step  = {};
		for (var i in args.props) {
			if ($type(this[i]) == 'number') {
				step[i] = (args.props[i] - this[i]) / args.frames;
			}
		}
		var frame = 0;
		var interval = function () {
			for (var i in step) {
				this[i] += step[i];
			}
			args.onProccess && args.onProccess.call(this);

			if (++frame >= args.frames) {
				$clear(interval);
				args.onFinish && args.onFinish.call(this);
			}
		}.bind(this).periodical(args.delay || 25);
		return this;
	}
});