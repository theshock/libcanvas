/*
---
description: Class which contains several basic mouse events 

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Inner.MouseEvents]
*/

LibCanvas.Inner.MouseEvents = new Class({
	subscribers : [],
	lastMouseMove : [],
	lastMouseDown : [],
	initialize : function (mouse) {
		this.mouse = mouse;
		this.point   = mouse.point;
	},
	subscribe : function (elem) {
		this.subscribers.include(elem);
		return this;
	},
	unsubscribe : function (elem) {
		this.subscribers.erase(elem);
		return this;
	},
	overElem : function (elem) {
		return this.mouse.inCanvas && elem.getShape().hasPoint(this.point);
	},
	getOverSubscribers : function () {
		var mouse = this;
		var elements = {
			over : [],
			out  : []
		};
		var maxOverMouseZ = 0;
		this.subscribers
			.sortBy('getZIndex')
			.each(function (elem) {
				if (elem.getZIndex() >= maxOverMouseZ && mouse.overElem(elem)) {
					maxOverMouseZ = elem.getZIndex();
					elements.over.push(elem);
				} else {
					elements.out.push(elem);
				}
			});
		return elements;

	},
	callEvent : function (elem, event, e) {
		if ($type(elem.bind) == 'function') {
			elem.bind(event, [event, e]);
		} else if ($type(elem.event) == 'function') {
			elem.event.call(elem, event, e);
		} else if (typeof(elem.event) == 'object') {
			if (elem.event[event]) {
				elem.event[event].call(elem, event, e);
			} else if (event.begins('away')) {
				if (typeof elem.event.away == 'object' &&
					elem.event.away[event.substr(5)]) {
					elem.event.away[event.substr(5)]
						.call(elem, event, e);
				}
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
			if (this.isOut) {
				mouse.callEvent(elem, 'away:mouseover', e);
			}
			var mouseout = false;
			if (['mousemove', 'mouseout'].contains(type)) {
				if (mouse.lastMouseMove.contains(elem)) {
					mouse.callEvent(elem, 'mouseout', e);
					if (type == 'mouseout') {
						mouse.callEvent(elem, 'away:mouseout', e);
					}
					mouse.lastMouseMove.erase(elem);
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