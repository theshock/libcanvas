/*
---

name: "Scene.Mouse"

description: "LibCanvas.Scene.Mouse"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Scene
	- Scene.MouseEvent

provides: Scene.Mouse

...
*/

Scene.Mouse = Class(
/**
 * @lends LibCanvas.Scene.Mouse#
 */
{

	/** @private */
	mouse: null,

	/** @constructs */
	initialize: function (globalMouse) {
		var mouse = this;

		mouse.lastMouseMove = [];
		mouse.lastMouseDown = [];

		mouse.subscribers = [];

		mouse.mouse = globalMouse;
		mouse.point = mouse.mouse.point;
	},

	/** @private */
	stopped: false,

	/** @returns {LibCanvas.Scene.Mouse} */
	stop: function () {
		this.stopped = true;
		return this;
	},

	/** @returns {LibCanvas.Scene.Mouse} */
	start: function () {
		this.stopped = false;
		return this;
	},

	/** @returns {LibCanvas.Scene.Mouse} */
	subscribe : function (elem) {
		this.subscribers.include(elem);
		return this;
	},

	/** @returns {LibCanvas.Scene.Mouse} */
	unsubscribe : function (elem) {
		this.subscribers.erase(elem);
		return this;
	},

	/** @private */
	event: function (type, e, stopped) {
		if (this.stopped) return;

		var event = new Scene.MouseEvent( type, e ), method = 'parseEvent';

		if (['dblclick', 'contextmenu', 'wheel'].contains( type )) {
			if (type == 'mousewheel') type = 'mousewheel';
			method = 'forceEvent';
		}
		return this[method]( type, event, stopped, this.subscribers );
	},

	isOver: function (element) {
		return this.mouse.inCanvas && element.hasPoint( this.point );
	},

	/** @private */
	parseEvent: function (type, event, stopped, elements) {
		if (type == 'down') this.lastMouseDown.empty();

		var i,
			elem,
			mouse    = this,
			lastDown = mouse.lastMouseDown,
			lastMove = mouse.lastMouseMove,
			lastOut  = [],
			eventArgs = [event];

		var fire = function (event) {
			this.fireEvent( event, eventArgs );
			var children = this.childrenElements;
			if (children.length) {
				mouse.event(type, event, stopped, children);
			}
		};

		elements.sortBy( 'zIndex', true );

		// В первую очередь - обрабатываем реальный mouseout с элементов
		if (type == 'move' || type == 'out') {
			for (i = lastMove.length; i--;) {
				elem = lastMove[i];
				if (!mouse.isOver(elem)) {
					fire.call( elem, 'mouseout' );
					lastMove.erase(elem);
					lastOut.push(elem);
				}
			}
		}

		for (i = elements.length; i--;) {
			elem = elements[i];
			// проваливание события остановлено элементом
			// необходимо сообщить остальным элементам о mouseout
			if (stopped) {
				if (type == 'move' || type == 'out') {
					if (lastMove.contains(elem)) {
						fire.call( elem, 'mouseout' );
						lastMove.erase(elem);
					}
				} else if (type == 'up') {
					if (mouse.isOver(elem)) {
						fire.call( elem, 'mouseup' );
						if (lastDown.contains(elem)) {
							fire.call( elem, 'click' );
						}
					}
				}
			// мышь над элементом, сообщаем о mousemove
			// о mouseover, mousedown, click, если необходимо
			} else if (mouse.isOver(elem)) {
				if (type == 'move') {
					if (!lastMove.contains(elem)) {
						fire.call( elem, 'mouseover' );
						lastMove.push( elem );
					}
				} else if (type == 'down') {
					lastDown.push(elem);
				// If mouseup on this elem and last mousedown was on this elem - click
				} else if (type == 'up' && lastDown.contains(elem)) {
					fire.call( elem, 'click' );
				}
				fire.call( elem, 'mouse' + type );

				if (!event.checkFalling()) stopped = true;
			// мышь не над элементом, событие проваливается,
			// сообщаем элементу, что где-то произошло событие
			} else if (!lastOut.contains(elem)) {
				// fast version
				elem.fireEvent( 'away:mouse' + type, eventArgs );
			}
		}

		return stopped;
	},

	/** @private */
	forceEvent: function (type, event, stopped, elements) {
		elements.sortBy( 'zIndex', true );
		var children, i = elements.length;
		while (i--) {
			var elem = elements[i];
			if (!this.mouse.isOver(elem)) return;
			
			elem.fireEvent( type, event );
			children = elem.childrenElements;
			if (children.length) {
				elem.event(type, event, stopped, children);
			}
			if (!event.checkFalling()) {
				stopped = true;
				break;
			}
		}
		return stopped;
	}

});