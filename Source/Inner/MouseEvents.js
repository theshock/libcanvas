/*
---

name: "Inner.MouseEvents"

description: "Class which contains several basic mouse events "

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point

provides: Inner.MouseEvents

...
*/

var MouseEvents = LibCanvas.Inner.MouseEvents = Class({
	initialize : function (mouse) {
		this.subscribers   = [];
		this.lastMouseMove = [];
		this.lastMouseDown = [];

		this.mouse = mouse;
		this.point = mouse.point;
		this.prev  = mouse.point.clone();
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
		return this.mouse.isOver( elem );
	},
	getOverSubscribers : function () {
		var elements = {
			over : [],
			out  : []
		};
		var maxOverMouseLCZ = 0, maxOverMouseZ = 0, sub = this.subscribers;
		sub.sort(function ($0, $1) {
			var diff = $1.libcanvas.zIndex - $0.libcanvas.zIndex;
			if (diff) return diff < 0 ? -1 : 1;
			diff = $1.getZIndex() - $0.getZIndex();
			return diff ? (diff < 0 ? -1 : 1) : 0;
		});
		
		
		for (var i = 0, l = sub.length; i < l; i++) {
			var elem = sub[i];
			
			if (elem.getZIndex() >= maxOverMouseZ
			 && elem.libcanvas.zIndex >= maxOverMouseLCZ
			 && this.overElem(elem)) {
				maxOverMouseZ   = elem.getZIndex();
				maxOverMouseLCZ = elem.libcanvas.zIndex;
				elements.over.push(elem);
			} else {
				elements.out.push(elem);
			}
		}
		return elements;
	},
	fireEvent : function (elem, eventName, e) {
		elem.fireEvent(eventName, [e, eventName]);
	},
	event : function (type, e) {
		var mouse = this,
			isMove = ['mousemove', 'mouseout'].contains(type),
			subscribers = this.getOverSubscribers();

		if (type == 'mousedown') mouse.lastMouseDown.empty();
		
		subscribers.over.forEach(function (elem) {
			// Mouse move firstly on this element
			if (type == 'mousemove' && !mouse.lastMouseMove.contains(elem)) {
				mouse.fireEvent(elem, 'mouseover', e);
				mouse.lastMouseMove.push(elem);
			} else if (type == 'mousedown') {
				mouse.lastMouseDown.push(elem);
			// If mouseup on this elem and last mousedown was on this elem - click
			} else if (type == 'mouseup' && mouse.lastMouseDown.contains(elem)) {
				mouse.fireEvent(elem, 'click', e);
			}
			mouse.fireEvent(elem, type, e);
		});

		subscribers.out.forEach(function (elem) {
			var mouseout = false;
			if (isMove && mouse.lastMouseMove.contains(elem)) {
				mouse.fireEvent(elem, 'mouseout', e);
				if (type == 'mouseout') mouse.fireEvent(elem, 'away:mouseout', e);
				mouse.lastMouseMove.erase(elem);
				mouseout = true;
			}
			if (!mouseout) mouse.fireEvent(elem, 'away:' + type, e);
		});

		return this;
	}
});