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
		this.animate.element  = element;
	}),

	animate : function (args) {
		var elem = this.animate.element || this;

		if (!args.props) {
			args = { props : args };
		} else {
			args = atom.extend({
				time: 500
			}, args);
		}

		var timeLeft = args.time, diff = {};
		for (var i in args.props) diff[i] = args.props[i] - elem[i];

		this.invoker.addFunction(20, function (time) {
			var timeElapsed = Math.min(time, timeLeft);

			timeLeft -= timeElapsed;

			
			for (var i in diff) {
				elem[i] += diff[i] * timeElapsed / args.time;
			}

			args.onProccess && args.onProccess.call(elem);

			if (timeLeft <= 0) {
				args.onFinish && args.onFinish.call(elem);
				return 'remove';
			}

			return true;
		});

		return this;
	}
});