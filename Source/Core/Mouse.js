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

provides: Mouse

...
*/

/** @class Mouse */
var Mouse = LibCanvas.declare( 'LibCanvas.Mouse', 'Mouse', {
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

		mouseover : 'over',
		mouseout  : 'out',
		mousedown : 'down',
		mouseup   : 'up',
		mousemove : 'move',

		DOMMouseScroll: 'wheel',
		mousewheel    : 'wheel'
	},

	initialize : function (elem, offsetElem) {
		this.bindMethods( 'onEvent' );

		if (elem == null) {
			throw new TypeError('`elem` is undefined');
		}

		this.elem       = atom.dom(elem);
		this.offsetElem = offsetElem ? atom.dom(offsetElem) : this.elem;

		this.point    = new Point(0, 0);
		this.previous = new Point(0, 0);
		this.delta    = new Point(0, 0);
		this.events   = new Events(this);

		this.listen(this.onEvent);
	},
	/** @private */
	fire: function (name, e) {
		this.events.fire(name, [e, this]);
		return this;
	},
	/** @private */
	onEvent: function (e) {
		var
			name = this.mapping[e.type],
			fn   = this.eventActions[name];

		if (fn) fn.call(this, e);

		this.fire(name, e);
	},
	/** @private */
	getOffset: function (e) {
		return this.constructor.getOffset(e, this.offsetElem);
	},
	/** @private */
	set: function (e, inside) {
		var point = this.getOffset(e);

		this.previous.set( this.point );
		this.delta   .set( this.previous.diff( point ) );
		this.point   .set( point );
		this.inside = inside;
	},
	/** @private */
	eventActions: {
		wheel: function (e) {
			this.constructor.addWheelDelta(e);
		},

		move: function (e) {
			this.set(e, true);
		},

		down: function (e) {
			this.set(e, true);
		},

		over: function (e) {
			if (this.checkEvent(e)) {
				this.fire('enter', e);
			}
		},

		out: function (e) {
			if (this.checkEvent(e)) {
				this.set(e, false);
				this.fire('leave', e);
			}
		}
	},
	/** @private */
	checkEvent: function (e) {
		var related = e.relatedTarget, elem = this.elem;

		return related == null || (
			related && related != elem.first && !elem.contains(related)
		);
	},
	/** @private */
	listen : function (callback) {
		this.elem
			.bind({ selectstart: false })
			.bind(atom.object.map(
				this.mapping, atom.fn.lambda(callback)
			));
	}
}).own({
	prevent: function (e) {e.preventDefault()},
	addWheelDelta: function (e) {
		e.delta =
			// IE, Opera, Chrome
			e.wheelDelta ? e.wheelDelta > 0 ? 1 : -1 :
			// Fx
			e.detail     ? e.detail     < 0 ? 1 : -1 : null;

		return e;
	},
	eventSource: function (e) {
		return e.changedTouches ? e.changedTouches[0] : e;
	},
	expandEvent: function (e) {
		var source = this.eventSource(e);

		if (e.pageX == null) {
			e.pageX = source.pageX != null ? source.pageX : source.clientX + document.scrollLeft;
			e.pageY = source.pageY != null ? source.pageY : source.clientY + document.scrollTop ;
		}

		return e;
	},
	getOffset : function (e, element) {
		var elementOffset = atom.dom(element || this.eventSource(e).target).offset();

		this.expandEvent(e);

		return new Point(
			e.pageX - elementOffset.x,
			e.pageY - elementOffset.y
		);
	}
});