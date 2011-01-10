/*
---
description: A mouse control abstraction class

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Mouse]
*/

LibCanvas.Mouse = atom.Class({
	initialize : function (libcanvas) {
		this.inCanvas = false;
		this.point = new LibCanvas.Point();

		//noTouch || this.initTouch();

		this.libcanvas = libcanvas;
		this.elem      = libcanvas.origElem;

		this.events = new LibCanvas.Inner.MouseEvents(this);

		this.setEvents();
	},
	setCoords : function (x, y) {
		if (arguments.length == 2) {
			this.point.moveTo(x, y);
			this.inCanvas = true;
		} else {
			this.point.moveTo(null, null);
			this.inCanvas = false;
		}
		return this;
	},
	getOffset : function (e) {
		if (!e.offset) this.expandEvent(e);
		return e.offset;
	},
	createOffset : function(elem) {
		var top = 0, left = 0;
		if (elem.getBoundingClientRect) {
			var box = elem.getBoundingClientRect();

			// (2)
			var body    = document.body;
			var docElem = document.documentElement;

			// (3)
			var scrollTop  = window.pageYOffset || docElem.scrollTop  || body.scrollTop;
			var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

			// (4)
			var clientTop  = docElem.clientTop  || body.clientTop  || 0;
			var clientLeft = docElem.clientLeft || body.clientLeft || 0;

			// (5)
			top  = box.top  + scrollTop  - clientTop;
			left = box.left + scrollLeft - clientLeft;

			return { top: top.round(), left: left.round() };
		} else {
			while(elem) {
				top  = top  + parseInt(elem.offsetTop);
				left = left + parseInt(elem.offsetLeft);
				elem = elem.offsetParent;
			}
			return { top: top, left: left };
		}
	},
	expandEvent : function (e) {
		if (!('page' in e && 'offset' in e)) {
			e.page = e.page || {
				x: 'pageX' in e ? e.pageX : e.clientX + document.scrollLeft,
				y: 'pageY' in e ? e.pageY : e.clientY + document.scrollTop 
			};
			var offset = this.createOffset(e.target);
			e.offsetX = event.page.x - offset.left;
			e.offsetY = event.page.y - offset.top;
			e.offset = new LibCanvas.Point({
				x: event.page.x - offset.left,
				y: event.page.y - offset.top
			});
		}
		return e;
	},
	setEvents : function () {
		var mouse = this;
		atom(this.elem).bind({
			/* bug in Linux Google Chrome 5.0.356.0 dev
			 * if moving mouse while some text is selected
			 * mouse becomes disable.
			 */
			mousemove : function (e) {
				var offset = mouse.getOffset(e);
				mouse.setCoords(offset.x, offset.y);
				mouse.events.event('mousemove', e);
				mouse.isOut = false;
				return false;
			},
			mouseout : function (e) {
				mouse.getOffset(e);
				mouse.setCoords(/* null */);
				mouse.events.event('mouseout', e);
				mouse.isOut = true;
				return false;
			},
			mousedown : function (e) {
				mouse.getOffset(e);
				mouse.events.event('mousedown', e);
				return false;
			},
			mouseup : function (e) {
				mouse.getOffset(e);
				mouse.events.event('mouseup'  , e);
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
			this.point.x.round(3) + ':' + this.point.y.round(3);
	}
});