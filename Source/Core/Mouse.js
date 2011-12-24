/*
---

name: "Mouse"

description: "A mouse control abstraction class"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Inner.MouseEvents

provides: Mouse

...
*/


var Mouse = LibCanvas.Mouse = Class(
/**
 * @lends LibCanvas.Mouse.prototype
 * @augments Class.Events.prototype
 */
{
	Implements: Class.Events,
	
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
		},
		createOffset : function(elem) {
			var top = 0, left = 0, offset;
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
		expandEvent: function (e) {
			var from = e.changedTouches ? e.changedTouches[0] : e;
			if (!('page' in e) || !('offset' in e)) {
				e.page = from.page || {
					x: 'pageX' in from ? from.pageX : from.clientX + document.scrollLeft,
					y: 'pageY' in from ? from.pageY : from.clientY + document.scrollTop
				};
				if ('offsetX' in from) {
					e.offset = new Point(from.offsetX, from.offsetY);
				} else {
					var offset = LibCanvas.Mouse.createOffset(from.target);
					e.offset = new Point({
						x: e.page.x - offset.left,
						y: e.page.y - offset.top
					});
					e.offsetX = e.offset.x;
					e.offsetY = e.offset.y;
				}
			}
			return e;
		},
		getOffset : function (e) {
			if (!e.offset) LibCanvas.Mouse.expandEvent(e);
			return e.offset;
		}
	},
	
	initialize : function (elem) {
		this.inCanvas = false;
		this.point = new Point(null, null);
		/** @private */
		this.prev  = new Point(null, null);
		/** @private */
		this.diff  = new Point(null, null);

		this.elem = elem;

		this.events = new MouseEvents(this);

		this.setEvents();
	},
	isOver: function (elem) {
		var translate = elem.mouseTranslate;
		if (translate) this.point.move( translate, true );
		var result = this.inCanvas && elem.hasPoint( this.point );
		if (translate) this.point.move( translate );
		return result;
	},
	button: function (key) {
		return this.self.buttons[key || 'left'];
	},
	setCoords : function (point, inCanvas) {
		this.prev.set( this.point );
		this.diff = this.prev.diff( point );
		this.inCanvas = inCanvas;
		this.point.move( this.diff );
		this.debugUpdate();
		return this;
	},
	getOffset : function (e) {
		return LibCanvas.Mouse.getOffset(e);
	},
	setEvents : function () {

		// e.previousOffset = prev.clone();
		// e.deltaOffset    = prev.diff( this.point );
		var mouse = this,
		waitEvent = function (event, isOffice) {
			if (event.match(/^mouse/)) {
				var shortE = event.substr(5);
			}

			return function (e) {
				prepare( e );
				var wait      = mouse.isEventAdded(event),
					waitShort = ( shortE && mouse.isEventAdded(shortE) );
				if (isOffice || wait || waitShort) mouse.getOffset(e);

				if (isOffice ) mouse.events.event(event, e);
				if (wait     ) mouse.fireEvent(event, [e]);
				if (waitShort) mouse.fireEvent(shortE, [e]);
				if (isOffice ) e.preventDefault();

				return !isOffice;
			};
		},
		waitWheel = waitEvent('wheel', false),
		prepare = function (e) {
			e.previousOffset = mouse.prev;
			e.deltaOffset = mouse.diff;
		},
		wheel = function (e) {
			e.delta =
				// IE, Opera, Chrome
				e.wheelDelta ? e.wheelDelta > 0 ? 1 : -1 :
				// Fx
				e.detail     ? e.detail     < 0 ? 1 : -1 : null;
			e.up   = e.delta > 0;
			e.down = e.delta < 0;
			waitWheel(e);
			mouse.events.event('wheel', e);
		},
		down = waitEvent('mousedown', true),
		up   = waitEvent('mouseup'  , true),
		over = waitEvent('mouseover', true),
		move = function ( e ) {
			var offset = mouse.getOffset(e);
			mouse.setCoords(offset, true);
			prepare( e );
			mouse.events.event('mousemove', e);
			mouse.fireEvent('move', [e]);
			mouse.isOut = false;
			e.preventDefault();
			return false;
		},
		out = function (e) {
			var offset = mouse.getOffset(e);
			mouse.setCoords(offset, false);
			prepare( e );
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
			mouseover  : over,
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
		if (on && !this.debugTrace) {
			this.debugTrace = new Trace();
		} else if (on === false) {
			this.debugTrace = null;
		}
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
