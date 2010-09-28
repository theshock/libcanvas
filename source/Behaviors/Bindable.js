/*
---
description: Provides interface for binding events to objects

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Bindable]
*/ 

LibCanvas.Behaviors.Bindable = new Class({
	binds : {},
	autoBinds : {},
	autoBind : function (event, args) {
		if ($type(event) == 'array') {
			event.each(function (e) {
				this.autoBind(e, args);
			}.bind(this));
			return this;
		}
		if ($type(args) != 'function') {
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
			if (result == 'unbind') {
				this.unbind(event, fn);
			}
		}
	},
	bind : function (event, fn) {
		if ($type(event) == 'array') {
			event.each(function (e) {
				this.bind(e, fn);
			}.bind(this));
			return this;
		}
		if ($type(fn) == 'function') {
			if (!(event in this.binds)) {
				this.binds[event] = [];
			}
			this.binds[event]
				.include(fn);
			if (event in this.autoBinds) {
				var ab = this.autoBinds[event];
				for (var i = 0, l = ab.length; i < l; i++) {
					this.callBind(event, fn, ab[i]);
				}
				// opera bug
				//this.autoBinds[event].each(function (args) {
				//	this.callBind(event, fn, args);
				//}.bind(this));
			}
		} else if (event in this.binds) {
			var args = fn;
			this.binds[event].each(function (fn) {
				this.callBind(event, fn, args);
			}.bind(this));
		}
		return this;
	},
	unbind : function (event, fn) {
		if ($type(event) == 'array') {
			event.each(function (e) {
				this.unbind(e, fn);
			}.bind(this));
			return this;
		}

		if (!fn) {
			this.binds[event] = [];
		} else if (event in this.binds) {
			this.binds[event].erase(fn);
		}
		return this;
	}
});