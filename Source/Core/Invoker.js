/*
---

name: "Invoker"

description: "Invoker calles functions"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Invoker

...
*/

LibCanvas.Invoker = atom.Class({
	Implements: [
		atom.Class.Options,
		atom.Class.Events
	],
	options: {
		fpsLimit : 60,
		timeCount: 5,
		context  : null,
		defaultPriority: 1
	},
	initialize: function (options) {
		this.setOptions(options);
	},
	funcs: [],
	time : [0],
	execTime: function (fn, context, args) {
		fn.apply(context, args || []);
		return ;
	},
	get minDelay () {
		return 1000 / this.options.fpsLimit;
	},
	timeoutId: 0,
	invoke: function () {
		this.fireEvent('beforeInvoke');

		var all  = this.time;
		var time = Math.max(all.average(), this.minDelay);
		this.timeoutId = this.invoke.delay(time, this);

		var startTime = new Date(),
			funcs     = this.funcs.sortBy('priority'),
			ignore    = false;

		for (var i = funcs.length; i--;) {
			if (funcs[i].call(this.options.context, time) === false) {
				ignore = true;
			}
		}
		if (!ignore) {
			all.push(new Date() - startTime);
			if (all.length > this.options.timeCount) all.shift();
		}

		this.fireEvent('afterInvoke', [time]);
		return this;
	},
	stop: function () {
		this.timeoutId.stop();
		return this;
	},
	addFunction: function (priority, fn) {
		if (arguments.length == 1) {
			fn = priority;
			fn.priority = this.options.defaultPriority;
		}
		if (typeof fn != 'function') {
			throw new TypeError('Not a function');
		}
		this.funcs.push(fn);
		return this;
	},
	rmFunction: function (fn) {
		this.funcs.erase(fn);
		return this;
	}
});

LibCanvas.Invoker.AutoChoose = atom.Class({
	get invoker () {
		return libcanvas in this ? this.libcanvas.invoker : LibCanvas.invoker;
	}
});