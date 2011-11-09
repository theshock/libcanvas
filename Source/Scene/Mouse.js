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
	initialize: function (scene) {
		var mouse = this;

		mouse.lastMouseMove = [];
		mouse.lastMouseDown = [];

		mouse.scene = scene;
		mouse.subscribers = [];

		var events = function (force, types) {
			var method = force ? 'forceEvent' : 'event';
			types.forEach(function (type) {
				mouse.mouse.addEvent( type, function (e) { mouse[method]( type, e ) } );
			});
		};

		mouse.mouse = scene.libcanvas.mouse;
		mouse.point = mouse.mouse.point;
		events(true , [ 'dblclick', 'contextmenu', 'wheel' ]);
		events(false, [ 'down', 'up', 'move', 'out' ]);
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
	event: function (type, e) {
		if (this.stopped || e._stopped) return;

		var event = new Scene.MouseEvent( type, e );

		if (['dblclick', 'contextmenu', 'wheel'].contains( type )) {
			return this.forceEvent( type == 'wheel' ? 'mousewheel' : type, e );
		}

		if (type == 'down') this.lastMouseDown.empty();

		var
			lastDown = this.lastMouseDown,
			lastMove = this.lastMouseMove,
			sub = this.subscribers.sortBy( 'zIndex', true );

		for (var i = sub.length; i--;) {
			var elem = sub[i];

			if (event.stopped) {
				if (type == 'move' || type == 'out') {
					if (lastMove.contains(elem)) elem.fireEvent( 'mouseout', [event] );
				} else if (type == 'up') {
					if (lastDown.contains(elem)) {
						elem.fireEvent( 'mouseup', [event] );
						if (this.mouse.isOver(elem)) {
							elem.fireEvent( 'click', [event] );
						}
					}
				}
			} else if (this.mouse.isOver(elem)) {
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
			} else {
				var mouseOut = false;
				if ( (type == 'move' || type == 'out') && lastMove.contains(elem)) {
					elem.fireEvent( 'mouseout', [event] );
					lastMove.erase(elem);
					mouseOut = true;
				}
				if (!mouseOut) elem.fireEvent( 'away:mouse' + type, [event] );
			}
		}
	},

	/** @private */
	forceEvent: function (type, e) {
		var
			event = new Scene.MouseEvent( type, e ),
			sub = this.subscribers.sortBy( 'zIndex', true ),
			i   = sub.length;
		while (i--) if (this.mouse.isOver(sub[i])) {
			sub[i].fireEvent( type, event );
			if (event.stopped) break;
		}
		return this;
	}

});