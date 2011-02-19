/*
---

name: "Behaviors.Animatable"

description: "Basic abstract class for animatable objects."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Invoker

provides: Behaviors.Animatable

...
*/

LibCanvas.namespace('Behaviors').Animatable = atom.Class({
	Implements: [LibCanvas.Invoker.AutoChoose],

	initialize: atom.Class.privateMethod(function (element) {
		this.animate.element = element;
	}),

	animate : function (args) {
		if (!args.props) {
			args = { props : args };
		}
		var elem   = this.animate.element || this;
		var step   = {};
		var frames = args.frames || 10;
		for (var i in args.props) {
			step[i] = (args.props[i] - elem[i]) / frames;
		}
		var frame = 0;
		var interval = function () {
			for (var i in step) elem[i] += step[i];
			
			args.onProccess && args.onProccess.call(elem);

			if (++frame >= frames) {
				interval.stop();
				args.onFinish && args.onFinish.call(elem);
			}
		}.periodical(args.delay || 25);
		return this;
	}
});