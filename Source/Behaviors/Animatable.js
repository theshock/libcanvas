/*
---
description: Basic abstract class for animatable objects.

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Animatable]
*/

LibCanvas.namespace('Behaviors').Animatable = atom.Class({
	animate : function (args) {
		var step  = {};
		var frames = args.frames || 10;
		for (var i in args.props) {
			var type = atom.typeOf(this[i]);
			if (type == 'number' || type == 'function') {
				step[i] = (args.props[i] - (type == 'function' ? this[i]() : this[i])) / frames;
			}
		}
		var frame = 0;
		var interval = function () {
			for (var i in step) {
				if (atom.typeOf(this[i]) == 'function') {
					this[i](this[i]() + step[i]);
				} else {
					this[i] += step[i];
				}
			}
			args.onProccess && args.onProccess.call(this);

			if (++frame >= frames) {
				interval.stop();
				args.onFinish && args.onFinish.call(this);
			}
		}.periodical(args.delay || 25, this);
		return this;
	}
});