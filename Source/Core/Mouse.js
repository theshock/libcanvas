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


var Mouse = new function () {
	function eventSource (e) {
		return e.changedTouches ? e.changedTouches[0] : e;
	}

	return declare( 'LibCanvas.Mouse', {
		own: {
			expandEvent: function (e) {
				var source = eventSource(e);

				e.pageX = source.pageX != null ? source.pageX : source.clientX + document.scrollLeft;
				e.pageY = source.pageY != null ? source.pageY : source.clientY + document.scrollTop ;

				return e;
			},
			getOffset : function (e, element) {
				var elementOffset = atom.dom(element || eventSource(e).target).offset();

				this.expandEvent(e);

				return new Point(
					e.pageX - elementOffset.x,
					e.pageY - elementOffset.y
				);
			}
		},

		prototype: {
			/** @private */
			elem: null,

			/** @property {boolean} */
			inside: false,
			/** @property {Point} */
			point: null,
			/** @property {Point} */
			previous: null,
			/** @property {Point} */
			delta: null,
			/** @property {Events} */
			events: null,

			/** @private */
			mapping: {
				click      : 'click',
				dblclick   : 'dblclick',
				contextmenu: 'contextmenu',

				mouseover  : 'over',
				mousedown  : 'down',
				mouseup    : 'up',
				mousemove  : 'move',
				mouseout   : 'out',

				DOMMouseScroll: 'wheel',
				mousewheel    : 'wheel'
			},

			initialize : function (elem, offsetElem) {
				this.bindMethods( 'onEvent' );

				this.elem       = atom.dom(elem);
				this.offsetElem = atom.dom(offsetElem) || this.elem;

				this.point    = new Point(0, 0);
				this.previous = new Point(0, 0);
				this.delta    = new Point(0, 0);
				this.events   = new Events(this);

				this.listen(this.onEvent);
			},
			/** @private */
			onEvent: function (e) {
				var
					event = this.mapping[e.type],
					fn    = this.eventActions[event];

				if (fn) fn.call( this, e );

				this.events.fire(this.mapping[event], [e, this]);
			},
			/** @private */
			getOffset: function (e) {
				return this.constructor.getOffset(e, this.offsetElem);
			},
			/** @private */
			set: function (e, inside) {
				var point = this.getOffset(e);

				this.prev .set( this.point );
				this.delta.set( this.prev.diff( point ) );
				this.point.set( point );
				this.inside = inside;
			},
			/** @private */
			eventActions: {
				wheel: function (e) {
					e.delta =
						// IE, Opera, Chrome
						e.wheelDelta ? e.wheelDelta > 0 ? 1 : -1 :
						// Fx
						e.detail     ? e.detail     < 0 ? 1 : -1 : null;
				},

				move: function (e) {
					this.set(e, true);
				},

				up: function (e) {
					this.set(e, false);
				}
			},
			/** @private */
			listen : function (callback) {
				this.elem.bind({
					click      : callback,
					dblclick   : callback,
					contextmenu: callback,

					mouseover  : callback,
					mousedown  : callback,
					mouseup    : callback,
					mousemove  : callback,
					mouseout   : callback,

					DOMMouseScroll: callback,
					mousewheel    : callback
				});
			}
		}
	});
};