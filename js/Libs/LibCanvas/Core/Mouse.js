
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
		if (!$chk(e.offsetX)) {
			e.offsetX = e.offsetX || e.layerX - e.target.offsetLeft;
			e.offsetY = e.offsetY || e.layerY - e.target.offsetTop;
		}
		return e;
	},
	setEvents : function () {
		var mouse = this;
		$(this.canvas.ctx.canvas).addEvents({
			mousemove : function (e) {
				try {
				e = mouse.expandEvent(e.event);
				mouse.setCoords(e.offsetX, e.offsetY);
				mouse.event('mousemove', e);
				// previous status for away:mouseover event
				mouse.mouseIsOut = false;
				} catch (e) { trace(e)}
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
			var evs  = [];
			var elem = this.subscribers[i];
			// If mouse is now over this element
			if (this.inCanvas && elem.getShape().hasDot(mouse.dot)) {
				if (type == 'mousemove') {
					// Mouse move firstly on this element
					if (!mouse.lastMouseMove.contains(elem)) {
						evs.push([elem, 'mouseover']);
						mouse.lastMouseMove.push(elem);
					}
				} else if (type == 'mousedown') {
					mouse.lastMouseDown.push(elem);
				// If mouseuped on this elem and last mousedown was on this elem - click
				} else if (type == 'mouseup' && mouse.lastMouseDown.contains(elem)) {
						
					evs.push([elem, 'click']);
				}
				evs.push([elem, type]);
			// If mouse move out of this element, but not out of canvas
			} else {
				if (this.mouseIsOut) {
					evs.push([elem, 'away:mouseover']);
				}
				var mouseout = false;
				if (['mousemove', 'mouseout'].contains(type)) {
					var index = mouse.lastMouseMove.indexOf(elem);
					if (index >= 0) {
						evs.push([mouse.lastMouseMove[index], 'mouseout']);
						mouse.lastMouseMove.remove(index);
						mouseout = true;
					}
				}
				if (!mouseout) {
					evs.push([elem, 'away:' + type]);
				}
			}
			evs.each(function (elem) {
				if ($type(elem[0].event) == 'function') {
					elem[0].event.call(elem[0], elem[1], e);
				} else if (typeof(elem[0].event) == 'object') {
					if (elem[1].begins('away')) {
						if (typeof elem[0].event.away == 'object' &&
							elem[0].event.away[elem[1].substr(5)]) {
							elem[0].event.away[elem[1].substr(5)]
								.call(elem[0], elem[1], e);
						}
					} else if (elem[0].event[elem[1]]) {
						elem[0].event[elem[1]].call(elem[0], elem[1], e);
					}
				}
			});
		}
		return this;
	}
});