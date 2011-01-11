/*
---

name: "Behaviors.Animatable"

description: "Basic abstract class for animatable objects."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Behaviors.Animatable

...
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