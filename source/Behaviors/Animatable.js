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
		var frames = args.frames || 10;
		for (var i in args.props) {
			var type = $type(this[i]);
			if (type == 'number' || type == 'function') {
				step[i] = (args.props[i] - (type == 'function' ? this[i]() : this[i])) / frames;
			}
		}
		var frame = 0;
		var interval = function () {
			for (var i in step) {
				if ($type(this[i]) == 'function') {
					this[i](this[i]() + step[i]);
				} else {
					this[i] += step[i];
				}
			}
			args.onProccess && args.onProccess.call(this);

			if (++frame >= frames) {
				$clear(interval);
				args.onFinish && args.onFinish.call(this);
			}
		}.bind(this).periodical(args.delay || 25);
		return this;
	}
});