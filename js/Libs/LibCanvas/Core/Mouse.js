
LibCanvas.Mouse = new Class({
	initialize : function (canvas) {
		this.inCanvas = false;
		this.dot = new LibCanvas.Dot();
		this.x = null;
		this.y = null;

		this.canvas = canvas;
		this.elem   = canvas.ctx.canvas;

		this.subscribers   = [];
		this.lastMouseMove = [];
		this.lastMouseDown = [];

		this.setEvents();
	},
	setCoords : function (x, y) {
		if (arguments.length == 2) {
			this.x = x;
			this.y = y;
			this.inCanvas = true;
		} else {
			this.x = null;
			this.y = null;
			this.inCanvas = false;
		}
		this.dot.set(this.x, this.y);
		return this;
	},
	setEvents : function () {
		var mouse = this;
		$(this.canvas.ctx.canvas).addEvents({
			mousemove : function (e) {
				e = e.event;
				// Count coords to canvas border
				mouse.setCoords(
					e.offsetX || e.layerX - e.target.offsetLeft,
					e.offsetY || e.layerY - e.target.offsetTop
				);
				mouse.event('mousemove', e);
			},
			mouseout : function (e) {
				mouse.setCoords();
				mouse.event('mouseout' , e.event);
			},
			mousedown : function (e) {
				mouse.event('mousedown', e.event);
			},
			mouseup : function (e) {
				mouse.event('mouseup'  , e.event);
			}
		});
		return this;
	},
	debug : function () {
		return !this.inCanvas ? 'NotInCanvas' :
			this.x.round(3) + ':' + this.y.round(3);
	},
	subscribe : function (elem) {
		if (!elem.getShape) {
			throw 'No Method "getShape"';
		}
		if (!elem.event) {
			throw 'No Method "event"';
		}
		this.subscribers.push(elem);
		return this;
	},
	unsubscribe : function (elem) {
		this.subscribers.erase(elem);
		return this;
	},
	event : function (type, e) {
		var mouse = this;
		if (type == 'mouseout') {
			// If mouse come out of canvas element we send to all
			// active elements "mouseout" event
			this.lastMouseMove.each(function (elem) {
				elem.event('mouseout', e);
			});
			this.lastMouseMove = [];
			return this;
		}
		if (type == 'mousedown') {
			mouse.lastMouseDown = [];
		}

		// Move throw all subscribed element
		for (var i = 0; i < this.subscribers.length; i++) {
			var elem = this.subscribers[i];

			// If mouse is now over this element
			if (elem.getShape().hasDot(mouse)) {
				// Mouse move firstly on this element
				if (type == 'mousemove' && !mouse.lastMouseMove.contains(elem)) {
					elem.event('mouseover', e);
					mouse.lastMouseMove.push(elem);
				} else if (type == 'mousedown') {
					mouse.lastMouseDown.push(elem);
				// If mouseuped on this elem and last mousedown was on this elem - click
				} else if (type == 'mouseup' && mouse.lastMouseDown.contains(elem)) {
					elem.event('click', e);
				}
				elem.event(type, e);
			} else {
			// If mouse move out of this element, but not out of canvas
				if (type == 'mousemove') {
					var index = mouse.lastMouseMove.indexOf(elem);
					if (index >= 0) {
						mouse.lastMouseMove[index].event('mouseout', e)
						mouse.lastMouseMove.remove(index);
						return this;
					}
				}
				elem.event('away:' + type, e);
			}
		}
		return this;
	}
});