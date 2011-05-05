/*
---

name: "Mouse"

description: "A mouse control abstraction class"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Inner.MouseEvents

provides: Mouse

...
*/


LibCanvas.Mouse = atom.Class({
	Implements: [ atom.Class.Events ],
	
	Static: {
		buttons: {
			left  : false,
			middle: false,
			// not supported
			right : false
		},
		listen: function () {
			var Mouse   = this,
				buttons = Mouse.buttons,
				set = function (val, b) {
					return function (e) {
						if (b == 'all') {
							for (var i in buttons) buttons[i] = val
						} else {
							b = b || ['left', 'middle'][e.button];
							if (b) buttons[b] = val;
						}
					};
				};
			atom.dom().bind({
				mousedown  : set(true),
				mouseup    : set(false),
				blur       : set(false, 'all')
			});
		}
	},
	
	initialize : function (libcanvas) {
		this.inCanvas = false;
		this.point = new LibCanvas.Point(null, null);

		this.libcanvas = libcanvas;
		this.elem      = libcanvas.wrapper;

		this.events = new LibCanvas.Inner.MouseEvents(this);

		this.setEvents();
	},
	button: function (key) {
		return this.self.buttons[key || 'left'];
	},
	setCoords : function (point) {
		if (point == null) {
			this.inCanvas = false;
		} else {
			this.point.moveTo(point);
			this.inCanvas = true;
		}
		this.debugUpdate();
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
			if ('offsetX' in e) {
				e.offset = new LibCanvas.Point(e.offsetX, e.offsetY);
			} else {
				var offset = this.createOffset(e.target);
				e.offset = new LibCanvas.Point({
					x: e.page.x - offset.left,
					y: e.page.y - offset.top
				});
				e.offsetX = e.offset.x;
				e.offsetY = e.offset.y;
			}
		}
		return e;
	},
	setEvents : function () {
		var mouse = this,
		waitEvent = function (event, isOffice) {
			return function (e) {
				var wait = mouse.isEventAdded(event);
				if (isOffice || wait) mouse.getOffset(e);
				if (isOffice) mouse.events.event(event, e);
				if (wait) mouse.fireEvent(event, [e]);
				if (isOffice) e.preventDefault();
				return !isOffice;
			};
		},
		waitWheel = waitEvent('wheel'),
		wheel = function (e) {
			e.delta =
				// IE, Opera, Chrome - multiplicity is 120
				e.wheelDelta ?  e.wheelDelta / 120 :
				// Fx
				e.detail     ? -e.detail / 3 : null;
			waitWheel(e);
		};

		atom.dom(mouse.elem).bind({
			click      : waitEvent('click'),
			dblclick   : waitEvent('dblclick'),
			contextmenu: waitEvent('contextmenu'),
			mousedown  : waitEvent('mousedown', true),
			mouseup    : waitEvent('mouseup'  , true),
			mousemove: function (e) {
				var offset = mouse.getOffset(e);
				mouse.setCoords(offset);
				mouse.events.event('mousemove', e);
				mouse.isOut = false;
				return false;
			},
			mouseout : function (e) {
				mouse.getOffset(e);
				mouse.setCoords(null);
				mouse.events.event('mouseout', e);
				mouse.fireEvent('mouseout', [e]);
				mouse.isOut = true;
				return false;
			},
			selectstart: false,
			DOMMouseScroll: wheel,
			mousewheel: wheel
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
	debugTrace: null,
	debugUpdate: function () {
		if (this.debugTrace) {
			this.debugTrace.trace( 'Mouse' +
				(this.inCanvas ? ': ' + this.point.x.round() + ',' + this.point.y.round() : ' is out of canvas')
			);
		}
	},
	debug : function (on) {
		this.debugTrace = on === false ? null : new LibCanvas.Utils.Trace();
		this.debugUpdate();
		return this;
	},
	dump: function () {
		var p = this.point;
		return '[Mouse(' + p.x + '*' + p.y + ')]';
	},
	toString: Function.lambda('[object LibCanvas.Mouse]')
});

LibCanvas.Mouse.listen();
