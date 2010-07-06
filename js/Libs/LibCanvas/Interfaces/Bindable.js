
LibCanvas.Interfaces.Bindable = new Class({
	binds : {},
	autoBinds : {},
	autoBind : function (event, args) {
		if ($type(args) != 'function') {
			this.autoBinds[event] = args;
			this.bind(event, args);
		}
		return this;
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
				fn.apply(this, this.autoBinds[event])
			}
		} else if (event in this.binds) {
			var args = fn;
			this.binds[event].each(function (fn) {
				fn.apply(this, args);
			}.bind(this));
		}
		return this;
	},
	unbind : function (event, fn) {
		if ($type(event) == 'array') {
			event.each(
				this.unbind.bind(this)
			);
			return this;
		}

		var deleteEvent = false;
		if (!fn) {
			deleteEvent = true;
		} else if (event in this.binds) {
			deleteEvent = !this
				.binds[event]
				.erase(fn);
		}
		if (deleteEvent) {
			delete this.binds[event];
		}
		return this;
	}
});