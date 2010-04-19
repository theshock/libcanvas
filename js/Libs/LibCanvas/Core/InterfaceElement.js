(function () {

var deactivateEvent = function (type, e) {
	this.active = false;
	this.callBinds(type, e);
	return this;
};

LibCanvas.InterfaceElement = new Class({
	initialize : function (shape) {
		this.shape  = shape;
		this.hover  = false;
		this.active = false;
		this.binds  = {};
	},
	setCanvas : function (canvas) {
		this.canvas = canvas;
		this.canvas.mouse.subscribe(this);
		return this;
	},
	getShape : function () {
		return this.shape;
	},
	/**
	 * events :
	 *
	 * click
	 *
	 * mouseover
	 * mousemove
	 * mouseout
	 * mouseup
	 * mousedown
	 *
	 * away:mouseover
	 * away:mousemove
	 * away:mouseout
	 * away:mouseup
	 * away:mousedown
	 */
	callBinds : function (type, e) {
		if (this.binds[type]) {
			this.binds[type].each(function (fn) {
				fn(e);
			});
		}
		return this;
	},
	event : {
		mouseover : function (type, e) {
			this.hover = true;
			this.callBinds(type, e);
			return this;
		},
		mouseout  : function (type, e) {
			this.hover = false;
			this.callBinds(type, e);
			return this;
		},
		mousedown  : function (type, e) {
			this.active = true;
			this.callBinds(type, e);
			return this;
		},
		mouseup : deactivateEvent,
		away : {
			mouseout : deactivateEvent,
			mouseup  : deactivateEvent
		}

	},
	draw : function () {
		if (this.active) {
			this.drawActive();
		} else if (this.hover) {
			this.drawHover();
		} else {
			this.drawStandart();
		}
		return this;
	},
	bind : function (event, fn) {
		var ename = event;
		if (event.begins('away')) {
			ename = event.substr(5);
			if (!this.event.away) {
				this.event.away = {};
			}
			if (!this.event.away[ename]) {
				this.event.away[ename] = function (type, e) {
					this.callBinds(type, e)
				}.bind(this);
			}
		} else if (!this.event[ename]) {
			this.event[ename] = function (type, e) {
				this.callBinds(type, e)
			}.bind(this);
		}

		this.binds[event] = this.binds[event] || [];
		this.binds[event].push(fn);
		return this;
	},
	unbind : function (event, fn) {
		if (this.binds[event]) {
			if (fn) {
				this.binds[event].erase(fn);
			}
			if (!fn || !this.binds[event].length) {
				this.binds[event] = undefined;
			}
		}
		return this;
	}
});
})();