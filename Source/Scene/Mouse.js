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

		var event = new Scene.MouseEvent( type, e );

		if (['dblclick', 'contextmenu', 'wheel'].contains( type )) {
			return this.forceEvent( type == 'wheel' ? 'mousewheel' : type, e );
		}

		if (type == 'down') this.lastMouseDown.empty();

		var i,
			elem,
			mouse    = this.mouse,
			lastDown = this.lastMouseDown,
			lastMove = this.lastMouseMove,
			lastOut  = [],
			sub = this.subscribers.sortBy( 'zIndex', true );

		if (type == 'move' || type == 'out') {
			for (i = lastMove.length; i--;) {
				elem = lastMove[i];
				if (!mouse.isOver(elem)) {
					elem.fireEvent( 'mouseout', [event] );
					lastMove.erase(elem);
					lastOut.push(elem);
				}
			}
		}

		for (i = sub.length; i--;) {
			elem = sub[i];

			if (stopped) {
				if (type == 'move' || type == 'out') {
					if (lastMove.contains(elem)) {
						elem.fireEvent( 'mouseout', [event] );
						lastMove.erase(elem);
					}
				} else if (type == 'up') {
					if (lastDown.contains(elem)) {
						elem.fireEvent( 'mouseup', [event] );
						if (mouse.isOver(elem)) {
							elem.fireEvent( 'click', [event] );
						}
					}
				}
			} else if (mouse.isOver(elem)) {
				if (type == 'move') {
					if (!lastMove.contains(elem)) {
					 	elem.fireEvent( 'mouseover', [event] );
						lastMove.push( elem );
					}
				} else if (type == 'down') {
					lastDown.push(elem);
				// If mouseup on this elem and last mousedown was on this elem - click
				} else if (type == 'up' && lastDown.contains(elem)) {
					elem.fireEvent( 'click', [event] );
				}
				elem.fireEvent( 'mouse' + type, [event] );

				if (!event.checkFalling()) stopped = true;
			} else if (!lastOut.contains(elem)) {
				elem.fireEvent( 'away:mouse' + type, [event] );
			}
		}

		return stopped;
	},

	/** @private */
	forceEvent: function (type, e, stopped) {
		if (stopped) return stopped;
		var
			event = new Scene.MouseEvent( type, e ),
			sub = this.subscribers.sortBy( 'zIndex', true ),
			i   = sub.length;
		while (i--) if (this.mouse.isOver(sub[i])) {
			sub[i].fireEvent( type, event );
			if (!event.checkFalling()) {
				stopped = true;
				break;
			}
		}
		return stopped;
	}

});