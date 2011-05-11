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
		var from = e.changedTouches ? e.changedTouches[0] : e;
		if (!('page' in e && 'offset' in e)) {
			e.page = from.page || {
				x: 'pageX' in from ? from.pageX : from.clientX + document.scrollLeft,
				y: 'pageY' in from ? from.pageY : from.clientY + document.scrollTop
			};
			if ('offsetX' in from) {
				e.offset = new LibCanvas.Point(from.offsetX, from.offsetY);
			} else {
				var offset = this.createOffset(from.target);
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
			if (event.match(/^mouse/)) {
				var shortE = event.substr(5);
			}

			return function (e) {
				var wait = mouse.isEventAdded(event);
				if (isOffice || wait) mouse.getOffset(e);
				if (isOffice) mouse.events.event(event, e);
				if (wait) {
					mouse.fireEvent(event, [e]);
					if (shortE) mouse.fireEvent(shortE, [e]);
				}
				if (isOffice) e.preventDefault();
				return !isOffice;
			};
		},
		waitWheel = waitEvent('wheel', false),
		wheel = function (e) {
			e.delta =
				// IE, Opera, Chrome - multiplicity is 120
				e.wheelDelta ?  e.wheelDelta / 120 :
				// Fx
				e.detail     ? -e.detail / 3 : null;
			e.up   = e.delta > 0;
			e.down = e.delta < 0;
			waitWheel(e);
		},
		down = waitEvent('mousedown', true),
		up   = waitEvent('mouseup'  , true),
		move = function ( e) {
			var offset = mouse.getOffset(e);
			mouse.setCoords(offset);
			mouse.events.event('mousemove', e);
			mouse.fireEvent('move', [e]);
			mouse.isOut = false;
			e.preventDefault();
			return false;
		},
		out = function (e) {
			mouse.getOffset(e);
			mouse.setCoords(null);
			mouse.events.event('mouseout', e);
			mouse.fireEvent('mouseout', [e]);
			mouse.fireEvent('out', [e]);
			mouse.isOut = true;
			e.preventDefault();
			return false;
		};

		atom.dom(mouse.elem).bind({
			click      : waitEvent('click', false),
			dblclick   : waitEvent('dblclick', false),
			contextmenu: waitEvent('contextmenu', false),
			// remove activating in android
			//touchstart : function (e) {
			//	move(false, e);
			//	down(e);
			//},
			//touchmove: move.bind(null, false),
			//touchend : function (e) {
			//	move(false, e);
			//	up(e);
			//	out(e);
			//},
			mousedown  : down,
			mouseup    : up,
			mousemove  : move,
			mouseout   : out,
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
