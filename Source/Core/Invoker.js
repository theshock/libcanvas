/*
---

name: "Invoker"

description: "Invoker calles functions"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Invoker

...
*/

var Invoker = declare( 'LibCanvas.Invoker',
/**
 * @lends LibCanvas.Invoker.prototype
 * @augments Class.Options.prototype
 * @augments Class.Events.prototype
 */
{
	own: {
		AutoChoose: declare({
			get invoker () {
				return 'libcanvas' in this ? this.libcanvas.invoker : LibCanvas.invoker;
			}
		})
	},
	mixin: [
		Settings.Mixin,
		Events.Mixin
	],
	proto: {
		initialize: function (options) {
			this.settings = new Settings({
				fpsLimit : 60,
				timeCount: 5,
				context  : null,
				defaultPriority: 1
			}).set(options);
			this.funcs = [];
			this.time  = [0];
		},
		get minDelay () {
			return 1000 / this.settings.get('fpsLimit');
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
				var result = funcs[i].call(this.settings.get('context'), time);
				if (result === false) {
					ignore = true;
				} else if (result === 'remove') {
					remove.push(funcs[i]);
				}
			}
			if (!ignore) {
				all.push(new Date() - startTime);
				if (all.length > this.settings.get('timeCount')) all.shift();
			}
			for (i = remove.length; i--;) {
				this.rmFunction(remove[i]);
			}

			this.events.fire('afterInvoke', [time]);
			return this;
		},
		after: function (timeLeft, priority, fn) {
			if (arguments.length == 2) {
				fn = priority;
				fn.priority = this.settings.get('defaultPriority');
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
				fn.priority = this.settings.get('defaultPriority');
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
	}
});