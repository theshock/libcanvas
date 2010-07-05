
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
				} catch (e) {trace(e)}
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
	overElem : function (elem) {
		return this.inCanvas && elem.getShape().hasDot(this.dot);
	},
	getOverSubscribers : function () {
		var mouse = this;
		var elements = {
			over : [],
			out  : []
		};
		var maxOverMouseZ = 0;
		this.subscribers
			.sortByZIndex()
			.each(function (elem) {
				var z = elem.getZIndex ? elem.getZIndex() : 0;
				if (z >= maxOverMouseZ && mouse.overElem(elem)) {
					maxOverMouseZ = z;
					elements.over.push(elem);
				} else {
					elements.out.push(elem);
				}
			});
		return elements;

	},
	callEvent : function (elem, event, e) {
		if ($type(elem.event) == 'function') {
			elem.event.call(elem, event, e);
		} else if (typeof(elem.event) == 'object') {
			if (event.begins('away')) {
				if (typeof elem.event.away == 'object' &&
					elem.event.away[event.substr(5)]) {
					elem.event.away[event.substr(5)]
						.call(elem, event, e);
				}
			} else if (elem.event[event]) {
				elem.event[event].call(elem, event, e);
			}
		}
	},
	event : function (type, e) {
		var mouse = this;
		var subscribers = this.getOverSubscribers();
		
		if (type == 'mousedown') {
			mouse.lastMouseDown = [];
		}

		subscribers.over.each(function (elem) {
			// Mouse move firstly on this element
			if (type == 'mousemove' && !mouse.lastMouseMove.contains(elem)) {
				mouse.callEvent(elem, 'mouseover', e);
				mouse.lastMouseMove.push(elem);
			} else if (type == 'mousedown') {
				mouse.lastMouseDown.push(elem);
			// If mouseuped on this elem and last mousedown was on this elem - click
			} else if (type == 'mouseup' && mouse.lastMouseDown.contains(elem)) {
				mouse.callEvent(elem, 'click', e);
			}
			mouse.callEvent(elem, type, e);
		});

		subscribers.out.each(function (elem) {
			if (this.mouseIsOut) {
				mouse.callEvent(elem, 'away:mouseover', e);
			}
			var mouseout = false;
			if (['mousemove', 'mouseout'].contains(type)) {
				var index = mouse.lastMouseMove.indexOf(elem);
				if (index >= 0) {
					mouse.callEvent(mouse.lastMouseMove[index], 'mouseout', e);
					mouse.lastMouseMove.remove(index);
					mouseout = true;
				}
			}
			if (!mouseout) {
				mouse.callEvent(elem, 'away:' + type, e);
			}
		});

		return this;
	}
});