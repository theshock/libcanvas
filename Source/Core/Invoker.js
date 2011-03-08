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

		var i, all = this.time,
			time   = Math.max(all.average(), this.minDelay);
		this.timeoutId = this.invoke.delay(time, this);

		var startTime = new Date(),
			funcs     = this.funcs.sortBy('priority'),
			ignore    = false,
			remove    = [];

		for (i = funcs.length; i--;) {
			var result = funcs[i].call(this.options.context, time);
			if (result === false) {
				ignore = true;
			} else if (result === 'remove') {
				remove.push(funcs[i]);
			}
		}
		if (!ignore) {
			all.push(new Date() - startTime);
			if (all.length > this.options.timeCount) all.shift();
		}
		for (i = remove.length; i--;) {
			this.rmFunction(remove[i]);
		}

		this.fireEvent('afterInvoke', [time]);
		return this;
	},
	after: function (timeLeft, priority, fn) {
		if (arguments.length == 2) {
			fn = priority;
			fn.priority = this.options.defaultPriority;
		}
		var timeStart = Date.now(), argTime = timeLeft;
		this.addFunction(priority, function (time) {
			timeLeft -= time;
			if (timeLeft < 0) {
				fn(Date.now() - timeStart - argTime);
				return 'remove';
			}
			return null;
		});
		return this;
	},
	stop: function () {
		this.timeoutId.stop();
		return this;
	},
	addFunction: function (priority, fn) {
		if (fn == null) {
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
	},
	toString: Function.lambda('[object LibCanvas.Invoker]')
});

LibCanvas.Invoker.AutoChoose = atom.Class({
	get invoker () {
		return 'libcanvas' in this ? this.libcanvas.invoker : LibCanvas.invoker;
	}
});