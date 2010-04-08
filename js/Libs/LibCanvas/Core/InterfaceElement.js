
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
	event : function (type, e) {
		if (type == 'mouseover') {
			this.hover = true;
		}
		if (type == 'mouseout') {
			this.hover = false;
		}
		if (type == 'mousedown') {
			this.active = true;
		}
		if (['away:mouseout', 'away:mouseup', 'mouseup'].contains(type)) {
			this.active = false;
		}
		if (this.binds[type]) {
			this.binds[type].each(function (fn) {
				fn(e);
			});
		}
		return this;
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