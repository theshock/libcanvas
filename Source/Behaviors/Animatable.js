/*
---

name: "Behaviors.Animatable"

description: "Basic abstract class for animatable objects."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

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

var Animatable = LibCanvas.Behaviors.Animatable = function () {

var TF = TimingFunctions;

return Class({
	Implements: Invoker.AutoChoose,

	initialize: Class.hiddenMethod(function (element) {
		this['animate.element'] = element;
		this['animate.func']    = atom.typeOf(element) == 'function';
	}),

	animate : function (key, value) {
		if (!this['animate.properties']) this['animate.properties'] = {};

		var args, elem = this['animate.element'] || this, isFn = !!this['animate.func'];

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
			time  : 500
		}, args);

		if (typeof args.props == 'function') {
			elem = args.props;
			isFn = true;
		}
		args.params = Array.from(args.params);

		if (!Array.isArray(args.fn)) {
			args.fn = args.fn.split('-');
		}

		var timeLeft = args.time,
			diff     = {},
			start    = {},
			inAction = this['animate.properties'],
			invoker  = this.invoker;

		var animation = {
			repeat: function () {
				this.animate(args);
			}.bind(this),
			stop : function () {
				// avoid calling twice
				animation.stop = Function.lambda();

				if (isFn) for (var i in args.props) inAction[i] = null;
				invoker.rmFunction(fn);
				args.onAbort && args.onAbort.call(this, animation, start);
				return this;
			}.bind(this),
			instance: this
		};

		if ('onProccess' in args) args.onProcess = args.onProccess;
		
		var fn = function (time) {
			timeLeft -= Math.min(time, timeLeft);

			var progress = (args.time - timeLeft) / args.time;

			var factor = TF.count(args.fn, progress, args.params);

			if (isFn) {
				elem.call(this, factor);
			} else {
				for (var i in diff) {
					Object.path.set( elem, i,
						start[i] instanceof Color ?
							start[i].shift(diff[i].clone().mul(factor)).toString() :
							start[i] + diff[i] * factor
					);
				}
			}

			args.onProcess && args.onProcess.call(this, animation, start);

			if (timeLeft <= 0) {
				args.onFinish && invoker.after(0, function() {
					args.onFinish.call(this, animation, start);
				}.bind(this));
				return 'remove';
			}

			return true;
		}.bind(this);


		if (!isFn) for (var i in args.props) {
			var elemValue = Object.path.get(elem, i);

			// if this property is already animating - remove
			if (i in inAction) invoker.rmFunction(inAction[i]);
			inAction[i] = fn;

			if (Color.isColorString(elemValue)) {
				start[i] = new Color(elemValue);
				diff[i]  = start[i].diff(args.props[i]);
			} else {
				start[i] = elemValue;
				diff[i]  = args.props[i] - elemValue;
			}
		}

		invoker.addFunction(20, fn);
		return animation;
	}
});

}();