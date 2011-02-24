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
	- Inner.TimingFunctions
	- Utils.Color

provides: Behaviors.Animatable

...
*/

(function (LibCanvas) {

var TF    = LibCanvas.Inner.TimingFunctions,
	Color = LibCanvas.Utils.Color;

LibCanvas.namespace('Behaviors').Animatable = atom.Class({
	Implements: [LibCanvas.Invoker.AutoChoose],

	initialize: atom.Class.privateMethod(function (element) {
		this.animate.element = element;
		this.animate.func    = atom.typeOf(element) == 'function';
	}),

	animatedProperties : {},

	animate : function (key, value) {
		var args, elem = this.animate.element || this, isFn = !!this.animate.func;

		if (typeof key == 'string' && arguments.length == 2) {
			args = {};
			args[key] = value;
		} else {
			args = key;
		}

		if (!isFn && !args.props) {
			args = { props : args };
		}
		args = atom.extend({
			fn    : 'linear',
			params: [],
			time  : 500,
		}, args);

		if (!Array.isArray(args.fn)) {
			args.fn = args.fn.split('-');
		}

		args.params = Array.from(args.params);

		var timeLeft = args.time,
			diff     = {},
			start    = {},
			inAction = this.animatedProperties,
			invoker  = this.invoker;

		var animation = {
			repeat: function () {
				this.animate(args);
			}.context(this),
			stop : function () {
				// avoid calling twice
				animation.stop = function () { return this };

				if (isFn) for (var i in args.props) inAction[i] = null;
				invoker.rmFunction(fn);
				args.onAbort && args.onAbort.call(this, animation, start);
				return this;
			}.context(this),
			instance: this
		};
		
		var fn = function (time) {
			var timeElapsed = Math.min(time, timeLeft);

			timeLeft -= timeElapsed;

			var progress = (args.time - timeLeft) / args.time;

			var factor = TF.count(args.fn, progress, args.params);

			if (isFn) {
				elem(factor);
			} else {
				for (var i in diff) {
					if (start[i] instanceof Color) {
						elem[i] = start[i].shift(diff[i].map(function(elem) {
							return elem * factor;
						})).toString();
					} else {
						elem[i] = start[i] + diff[i] * factor;
					}
				}
			}

			args.onProccess && args.onProccess.call(this, animation, start);

			if (timeLeft <= 0) {
				args.onFinish && invoker.after(0, function() {
					args.onFinish.call(this, animation, start);
				}.context(this));
				return 'remove';
			}

			return true;
		}.context(this);



		if (!isFn) for (var i in args.props) {
			// if this property is already animating - remove
			if (i in inAction) invoker.rmFunction(inAction[i]);
			inAction[i] = fn;
			if (Color.isColorString(elem[i])) {
				start[i] = new Color(elem[i]);
				diff[i]  = start[i].diff(args.props[i]);
			} else {
				start[i] = elem[i];
				diff[i]  = args.props[i] - elem[i];
			}
		}

		invoker.addFunction(20, fn);
		return animation;
	}
});

})(LibCanvas);