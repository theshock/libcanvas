/*
---

name: "LibCanvas.Behaviors.Bindable"

description: "Provides interface for binding events to objects."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
- "Shock <shocksilien@gmail.com>"

requires:
- LibCanvas

provides: LibCanvas.Behaviors.Bindable

...
*/

LibCanvas.namespace('Behaviors').Bindable = atom.Class({
	binds : {},
	autoBinds : {},
	autoBind : function (event, args) {
		if (Array.isArray(event)) {
			event.forEach(function (e) {
				this.autoBind(e, args);
			}.context(this));
			return this;
		}
		if (typeof args != 'function') {
			if (!this.autoBinds[event]) {
				this.autoBinds[event] = [];
			}
			this.autoBinds[event].push(args);
			this.bind(event, args);
		}
		return this;
	},
	callBind : function (event, fn, args) {
		var result = fn.apply(this, args);
		if (typeof result == 'string') {
			result = result.toLowerCase();
			if (result == 'unbind') this.unbind(event, fn);
		}
	},
	bind : function (event, fn) {
		var i, l, ab, b, args;
		if (Array.isArray(event)) {
			for (i = event.length; i--;) this.bind(event[i], fn);
			return this;
		}
		if (typeof fn == 'function') {
			if (!(event in this.binds)) {
				this.binds[event] = [];
			}
			this.binds[event].include(fn);
			if (event in this.autoBinds) {
				ab = this.autoBinds[event];
				for (i = 0, l = ab.length; i < l; i++) {
					this.callBind(event, fn, ab[i]);
				}
			}
		} else if (event in this.binds) {
			args = fn, b = this.binds[event];
			for (i = 0, l = b.length; i < l; i++) {
				this.callBind(event, b[i], args);
			}
		}
		return this;
	},
	unbind : function (event, fn) {
		if (Array.isArray(event)) {
			for (var i = event.length; i--;) this.unbind(event[i], fn);
			return this;
		}

		if (!fn) this.binds[event] = [];
		else if (event in this.binds) {
			this.binds[event].erase(fn);
		}
		return this;
	}
});