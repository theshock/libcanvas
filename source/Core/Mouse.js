/*
---
description: A mouse control abstraction class

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Mouse]
*/

LibCanvas.Mouse = new Class({
	initialize : function (libcanvas) {
		this.inCanvas = false;
		this.point = new LibCanvas.Point();
		this.x = null;
		this.y = null;
		this.scaleData = {x:1, y:1};

		//noTouch || this.initTouch();

		this.libcanvas = libcanvas;
		this.elem      = libcanvas.origElem;

		this.events = new LibCanvas.Inner.MouseEvents(this);

		this.setEvents();
	},
	setScale : function (x, y) {
		this.scaleData = {x:x, y:y};
		return this;
	},
	scale : function (x, y) {
		this.scaleData.x *= x;
		this.scaleData.y *= y;
		return this;
	},
	setCoords : function (x, y) {
		if (arguments.length == 2) {
			this.x = x / this.scaleData.x;
			this.y = y / this.scaleData.y;
			this.inCanvas = true;
		} else {
			this.x = null;
			this.y = null;
			this.inCanvas = false;
		}
		this.point.set(this.x, this.y);
		return this;
	},
	getOffset : function (e) {
		if (e.event) e = e.event;
		if (!e.offset) {
			this.expandEvent(e);
		}
		return e.offset;
	},
	createOffset : function(elem) {
		var top = 0, left = 0;
		if (elem.getBoundingClientRect) {
			var box = elem.getBoundingClientRect();

			// (2)
			var body = document.body;
			var docElem = document.documentElement;

			// (3)
			var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
			var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

			// (4)
			var clientTop = docElem.clientTop || body.clientTop || 0;
			var clientLeft = docElem.clientLeft || body.clientLeft || 0;

			// (5)
			top  = box.top  + scrollTop  - clientTop;
			left = box.left + scrollLeft - clientLeft;

			return { top: Math.round(top), left: Math.round(left) };
		} else {
			while(elem) {
				top  = top  + parseInt(elem.offsetTop);
				left = left + parseInt(elem.offsetLeft);
				elem = elem.offsetParent;
			}
			return {top: top, left: left};
		}
	},
	expandEvent : function (e) {
		var event = new Event(e);
		if (!$chk(e.offsetX)) {
			var offset = this.createOffset(e.target);
			e.offsetX = event.page.x - offset.left;
			e.offsetY = event.page.y - offset.top;
		}
		e.offset = new LibCanvas.Point(e.offsetX, e.offsetY);
		return e;
	},
	setEvents : function () {
		var mouse = this;
		$(this.elem).addEvents({
			/* bug in Linux Google Chrome 5.0.356.0 dev
			 * if moving mouse while some text is selected
			 * mouse becomes disable.
			 */
			mousemove : function (e) {
				var offset = mouse.getOffset(e);
				mouse.setCoords(offset.x, offset.y);
				mouse.events.event('mousemove', e.event);
				mouse.isOut = false;
				return false;
			},
			mouseout : function (e) {
				mouse.getOffset(e);
				mouse.setCoords(/* null */);
				mouse.events.event('mouseout', e.event);
				mouse.isOut = true;
				return false;
			},
			mousedown : function (e) {
				mouse.getOffset(e);
				mouse.events.event('mousedown', e.event);
				return false;
			},
			mouseup : function (e) {
				mouse.getOffset(e);
				mouse.events.event('mouseup'  , e.event);
				return false;
			}
		});
		return this;
	},
	subscribe : function (elem) {
		this.events.subscribe(elem);
		return this;
	},
	unsubscribe : function (elem) {
		this.events.unsubscribe(elem);
		return this;
	},
	debug : function () {
		return !this.inCanvas ? 'NotInCanvas' :
			this.x.round(3) + ':' + this.y.round(3);
	}
});