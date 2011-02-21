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

provides: Behaviors.Animatable

...
*/

new function () {

var TF = LibCanvas.Inner.TimingFunctions;

var Factor = function (fn) {
	return {
		Factor: Factor,
		_factor: 0,
		get factor () {
			return this._factor;
		},
		set factor (value) {
			var change = value - this._factor;
			this._factor = value;
			fn(change)
		}
	};
};

LibCanvas.namespace('Behaviors').Animatable = atom.Class({
	Implements: [LibCanvas.Invoker.AutoChoose],

	initialize: atom.Class.privateMethod(function (element) {
		this.animate.element = atom.typeOf(element) == 'function' ?
			Factor(element) : element;
	}),

	animatedProperties : {},

	animate : function (key, value) {
		var args, elem = this.animate.element || this;
		if (typeof key == 'string' && arguments.length == 2) {
			args = {};
			args[key] = value;
		} else {
			args = key;
		}

		if (!args.props) {
			if (elem.Factor == Factor) {
				args.props = { factor : 1 };
			} else {
				args = { props : args };
			}
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

		var fn = function (time) {
			var timeElapsed = Math.min(time, timeLeft);

			timeLeft -= timeElapsed;

			var progress = (args.time - timeLeft) / args.time;

			var factor = TF.count(args.fn, progress, args.params);

			for (var i in diff) elem[i] = start[i] + diff[i] * factor;

			args.onProccess && args.onProccess.call(elem);

			if (timeLeft <= 0) {
				args.onFinish && args.onFinish.call(elem);
				return 'remove';
			}

			return true;
		};



		for (var i in args.props) {
			// if this property is already animating - remove
			if (i in inAction) invoker.rmFunction(inAction[i]);
			inAction[i] = fn;
			diff[i]  = args.props[i] - elem[i];
			start[i] = elem[i];
		}

		invoker.addFunction(20, fn);
		return {
			stop : function () {
				for (var i in args.props) inAction[i] = null;
				invoker.rmFunction(fn);
				return this;
			}
		};
	}
});

};