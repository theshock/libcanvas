
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
	setCoords : function (x, y, prev) {
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
	expandEvent : function (e) {
		e.offsetX = e.offsetX || e.layerX - e.target.offsetLeft;
		e.offsetY = e.offsetY || e.layerY - e.target.offsetTop;
		return e;
	},
	setEvents : function () {
		var mouse = this;
		$(this.canvas.ctx.canvas).addEvents({
			mousemove : function (e) {
				e = mouse.expandEvent(e.event);
				mouse.setCoords(e.offsetX, e.offsetY);
				mouse.event('mousemove', e);
				// previous status for away:mouseover event
				mouse.mouseIsOut = false;
			},
			mouseout : function (e) {
				mouse.setCoords();
				mouse.event('mouseout' , mouse.expandEvent(e.event));
				// previous status for away:mouseover event
				mouse.mouseIsOut = true;
			},
			mousedown : function (e) {
				mouse.event('mousedown', mouse.expandEvent(e.event));
			},
			mouseup : function (e) {
				mouse.event('mouseup'  , mouse.expandEvent(e.event));
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
		
		if (type == 'mousedown') {
			mouse.lastMouseDown = [];
		}

		// Move throw all subscribed element
		for (var i = 0; i < this.subscribers.length; i++) {
			var elem = this.subscribers[i];
			// If mouse is now over this element
			if (this.inCanvas && elem.getShape().hasDot(mouse.dot)) {
				if (type == 'mousemove') {
					// Mouse move firstly on this element
					if (!mouse.lastMouseMove.contains(elem)) {
						elem.event('mouseover', e);
						mouse.lastMouseMove.push(elem);
					}
				} else if (type == 'mousedown') {
					mouse.lastMouseDown.push(elem);
				// If mouseuped on this elem and last mousedown was on this elem - click
				} else if (type == 'mouseup' && mouse.lastMouseDown.contains(elem)) {
					elem.event('click', e);
				}
				elem.event(type, e);
			// If mouse move out of this element, but not out of canvas
			} else {
				if (this.mouseIsOut) {
					elem.event('away:mouseover', e);
				}
				if (['mousemove', 'mouseout'].contains(type)) {
					var index = mouse.lastMouseMove.indexOf(elem);
					if (index >= 0) {
						mouse.lastMouseMove[index].event('mouseout', e)
						mouse.lastMouseMove.remove(index);
						continue;
					}
				}
				elem.event('away:' + type, e);
			}
		}
		return this;
	}
});