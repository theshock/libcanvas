/*
---

name: "LibCanvas.Inner.MouseEvents"

description: "Class which contains several basic mouse events "

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
- "Shock <shocksilien@gmail.com>"

requires:
- LibCanvas
- LibCanvas.Point

provides: LibCanvas.Inner.MouseEvents

...
*/

LibCanvas.namespace('Inner').MouseEvents = atom.Class({
	subscribers : [],
	lastMouseMove : [],
	lastMouseDown : [],
	initialize : function (mouse) {
		this.mouse = mouse;
		this.point = mouse.point;
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
		var elements = {
			over : [],
			out  : []
		};
		var maxOverMouseZ = 0, sub = this.subscribers.sortBy('getZIndex');
		for (var i = 0, l = sub.length; i < l; i++) {
			var elem = sub[i];
			if (elem.getZIndex() >= maxOverMouseZ && this.overElem(elem)) {
				maxOverMouseZ = elem.getZIndex();
				elements.over.push(elem);
			} else {
				elements.out.push(elem);
			}
		}
		return elements;
	},
	fireEvent : function (elem, event, e) {
		elem.bind(event, [event, e]);
	},
	event : function (type, e) {
		var mouse = this, subscribers = this.getOverSubscribers();

		if (type == 'mousedown') mouse.lastMouseDown.empty();
		
		subscribers.over.forEach(function (elem) {
			// Mouse move firstly on this element
			if (type == 'mousemove' && !mouse.lastMouseMove.contains(elem)) {
				mouse.fireEvent(elem, 'mouseover', e);
				mouse.lastMouseMove.push(elem);
			} else if (type == 'mousedown') {
				mouse.lastMouseDown.push(elem);
			// If mousepe on this elem and last mousedown was on this elem - click
			} else if (type == 'mouseup' && mouse.lastMouseDown.contains(elem)) {
				mouse.fireEvent(elem, 'click', e);
			}
			mouse.fireEvent(elem, type, e);
		});

		subscribers.out.forEach(function (elem) {
			// if (this.isOut) mouse.fireEvent(elem, 'away:mouseover', e);
			var mouseout = false;
			if (['mousemove', 'mouseout'].contains(type)) {
				if (mouse.lastMouseMove.contains(elem)) {
					mouse.fireEvent(elem, 'mouseout', e);
					if (type == 'mouseout') mouse.fireEvent(elem, 'away:mouseout', e);
					mouse.lastMouseMove.erase(elem);
					mouseout = true;
				}
			}
			if (!mouseout) mouse.fireEvent(elem, 'away:' + type, e);
		});

		return this;
	}
});