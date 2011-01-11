/*
---

name: "LibCanvas"

description: "LibCanvas initialization"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>
	- Anna Shurubey aka Nutochka <iamnutochka@gmail.com>
	- Nikita Baksalyar <nikita@baksalyar.ru>

provides: LibCanvas

...
*/


(function () {

var LibCanvas = window.LibCanvas = atom.Class({
	Static: {
		Buffer: function (width, height, withCtx) {
			var a = Array.pickFrom(arguments), zero = (width == null || width === true);
			width   = zero ? 0 : a[0];
			height  = zero ? 0 : a[1];
			withCtx = zero ? a[0] : a[2];
			
			var canvas = atom()
				.create("canvas", {
					width  : width,
					height : height
				}).get();
			
			if (withCtx) canvas.ctx = canvas.getContext('2d-libcanvas');
			return canvas;
		},
		isLibCanvas: function (elem) {
			return elem && elem instanceof LibCanvas.Canvas2D;
		},
		namespace: function (namespace) {
			var current = LibCanvas;
			namespace.split('.').forEach(function(part){
				if (current[part] == null) current[part] = {};
				current = current[part];
			});
			return current;
		},
		extract: function (to, what) {
			to = to || window;
			for (var i in {Shapes: 1, Behaviors: 1, Utils: 1}) {
				if (!what || what.contains(i)) atom.extend(to, LibCanvas[i]);
			}
			for (i in {Point: 1, Animation: 1, Buffer: 1}) {
				if (!what || what.contains(i)) to[i] = LibCanvas[i];
			}
			return to;
		},
		newContexts: {},
		addCanvasContext: function (name, ctx) {
			this.newContexts[name] = ctx;
			return this;
		},
		getCanvasContext: function (name) {
			return this.newContexts[name] || null;
		}
	},
	initialize: function() {
		return LibCanvas.Canvas2D.factory(arguments);
	}
});
	
// Changing HTMLCanvasElement.prototype.getContext, so we
// can create our own contexts by LibCanvas.addCanvasContext(name, ctx);
atom.implement(HTMLCanvasElement, {
	getOriginalContext: HTMLCanvasElement.prototype.getContext,
	getContext: function (type) {
		if (!this.contextsList) {
			this.contextsList = {};
		}

		if (!this.contextsList[type]) {
			var ctx;
			if (ctx = LibCanvas.getCanvasContext(type)) {
				ctx = new ctx(this);
			} else try {
				ctx = this.getOriginalContext.apply(this, arguments);
			} catch (e) {
				throw (!e.toString().test(/NS_ERROR_ILLEGAL_VALUE/)) ? e :
					new TypeError('Wrong Context Type: «' + type + '»');
			}
			this.contextsList[type] = ctx;
		}
		return this.contextsList[type];
	}
});

})();

/*
---

name: "Behaviors.Animatable"

description: "Basic abstract class for animatable objects."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Behaviors.Animatable

...
*/

LibCanvas.namespace('Behaviors').Animatable = atom.Class({
	animate : function (args) {
		var step  = {};
		var frames = args.frames || 10;
		for (var i in args.props) {
			var type = atom.typeOf(this[i]);
			if (type == 'number' || type == 'function') {
				step[i] = (args.props[i] - (type == 'function' ? this[i]() : this[i])) / frames;
			}
		}
		var frame = 0;
		var interval = function () {
			for (var i in step) {
				if (atom.typeOf(this[i]) == 'function') {
					this[i](this[i]() + step[i]);
				} else {
					this[i] += step[i];
				}
			}
			args.onProccess && args.onProccess.call(this);

			if (++frame >= frames) {
				interval.stop();
				args.onFinish && args.onFinish.call(this);
			}
		}.periodical(args.delay || 25, this);
		return this;
	}
});

/*
---

name: "Behaviors.Bindable"

description: "Provides interface for binding events to objects."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Behaviors.Bindable

...
*/

LibCanvas.namespace('Behaviors').Bindable = atom.Class({
	binds : {},
	autoBinds : {},
	autoBind : function (event, args) {
		if (Array.isArray(event)) {
			event.forEach(function (e) {
				this.autoBind(e, args);
			}.context(this));
			return this;
		}
		if (typeof args != 'function') {
			if (!this.autoBinds[event]) {
				this.autoBinds[event] = [];
			}
			this.autoBinds[event].push(args);
			this.bind(event, args);
		}
		return this;
	},
	callBind : function (event, fn, args) {
		var result = fn.apply(this, args);
		if (typeof result == 'string') {
			result = result.toLowerCase();
			if (result == 'unbind') this.unbind(event, fn);
		}
	},
	bind : function (event, fn) {
		var i, l, ab, b, args;
		if (Array.isArray(event)) {
			for (i = event.length; i--;) this.bind(event[i], fn);
			return this;
		}
		if (typeof fn == 'function') {
			if (!(event in this.binds)) {
				this.binds[event] = [];
			}
			this.binds[event].include(fn);
			if (event in this.autoBinds) {
				ab = this.autoBinds[event];
				for (i = 0, l = ab.length; i < l; i++) {
					this.callBind(event, fn, ab[i]);
				}
			}
		} else if (event in this.binds) {
			args = fn, b = this.binds[event];
			for (i = 0, l = b.length; i < l; i++) {
				this.callBind(event, b[i], args);
			}
		}
		return this;
	},
	unbind : function (event, fn) {
		if (Array.isArray(event)) {
			for (var i = event.length; i--;) this.unbind(event[i], fn);
			return this;
		}

		if (!fn) this.binds[event] = [];
		else if (event in this.binds) {
			this.binds[event].erase(fn);
		}
		return this;
	}
});

/*
---

name: "Geometry"

description: "Base for such things as Point and Shape"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Bindable

provides: Geometry

...
*/

LibCanvas.Geometry = atom.Class({
	Implements: [LibCanvas.Behaviors.Bindable],
	Static: {
		from : function (obj) {
			return obj[0] instanceof this ? obj[0] : obj instanceof this ? obj : new this(obj);
		}
	},
	initialize : function () {
		if (arguments.length) this.set.apply(this, arguments);
	},
	invertDirection: function (distance, reverse) {
		var multi = reverse ? -1 : 1;
		return {
			x : distance.x * multi,
			y : distance.y * multi
		};
	},
	move : function (distance, reverse) {
		this.bind('move', [this.invertDirection(distance, reverse)]);
		return this;
	}
});

/*
---

name: "Utils.Math"

description: "Helpers for basic math operations, such as degree, hypotenuse from two cathetus, etc"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

provides: Utils.Math

...
*/

// Number
(function () {


var degreesCache = {};

atom.implement(Number, {
	/**
	 * Cast degrees to radians
	 * (90).degree() == Math.PI/2
	 */
	degree: function () {
		return this in degreesCache ? degreesCache[this] :
			this * Math.PI / 180;
	},
	/**
	 * Cast radians to degrees
	 * (Math.PI/2).getDegree() == 90
	 */
	getDegree: function (round) {
		return arguments.length == 0 ?
			this / Math.PI * 180 :
			this.getDegree().round(round);
	},
	normalizeAngle : function () {
		var num  = this % d360;
		return num < 0 ? num + d360 : num;
	},
	normalizeDegree : function (base) {
		return this
			.getDegree()
			.round(base || 0)
			.degree()
			.normalizeAngle();
	}
});

for (var degree in [0, 45, 90, 135, 180, 225, 270, 315, 360].toKeys()) {
	degreesCache[degree] = (degree * 1).degree();
}
var d360 = degreesCache[360];

})();

atom.extend(Math, {
	hypotenuse: function (cathetus1, cathetus2)  {
		return (cathetus1*cathetus1 + cathetus2*cathetus2).sqrt();
	},
	cathetus: function (hypotenuse, cathetus2)  {
		return (hypotenuse*hypotenuse - cathetus2*cathetus2).sqrt();
	}
});

/*
---

name: "Point"

description: "A X/Y point coordinates encapsulating class"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Geometry
	- Utils.Math

provides: Point

...
*/

(function () {

var shifts = {
	top    : {x: 0, y:-1},
	right  : {x: 1, y: 0},
	bottom : {x: 0, y: 1},
	left   : {x:-1, y: 0},
	t      : {x: 0, y:-1},
	r      : {x: 1, y: 0},
	b      : {x: 0, y: 1},
	l      : {x:-1, y: 0},
	tl     : {x:-1, y:-1},
	tr     : {x: 1, y:-1},
	bl     : {x:-1, y: 1},
	br     : {x: 1, y: 1}
};

var Point = LibCanvas.Point = atom.Class({
	Extends: LibCanvas.Geometry,
	set : function (x, y) {
		if (arguments.length != 2) {
			if (0 in x && 1 in x) {
				y = x[1];
				x = x[0];
			} else if ('x' in x && 'y' in x) {
				y = x.y;
				x = x.x;
			} else {
				atom.log('Wrong Arguments In Point.Set:', arguments);
				throw new TypeError('Wrong Arguments In Point.Set')
			}
		}
		this.x = x == null ? x : Number(x);
		this.y = y == null ? y : Number(y);
		return this;
	},
	move: function (distance, reverse) {
		distance = this.self.from(distance);
		distance = this.invertDirection(distance, reverse);
		this.x += distance.x;
		this.y += distance.y;

		return this.parent(distance, false);
	},
	moveTo : function (newCoord, speed) {
		return speed ?
			this.animateMoveTo(newCoord, speed) :
			this.move(this.diff(newCoord));
	},
	angleTo : function (point) {
		var diff = Point.from(arguments).diff(this);
		return Math.atan2(diff.y, diff.x).normalizeAngle();
	},
	distanceTo : function (point) {
		var diff = Point.from(arguments).diff(this);
		return Math.hypotenuse(diff.x, diff.y);
	},
	diff : function (point) {
		return Point.from(arguments)
			.clone().move(this, true);
	},
	rotate : function (angle, pivot) {
		pivot = Point.from(pivot || {x: 0, y: 0});
		if (this.equals(pivot)) return this;
		
		var radius = pivot.distanceTo(this);
		var sides  = pivot.diff(this);
		var newAngle = Math.atan2(sides.x, sides.y) - angle;

		return this.moveTo({
			x : newAngle.sin() * radius + pivot.x,
			y : newAngle.cos() * radius + pivot.y
		});
	},
	scale : function (power, pivot) {
		pivot = Point.from(pivot || {x: 0, y: 0});
		var diff = this.diff(pivot), isObject = typeof power == 'object';
		return this.moveTo({
			x : pivot.x - diff.x  * (isObject ? power.x : power),
			y : pivot.y - diff.y  * (isObject ? power.y : power)
		});
	},
	alterPos : function (arg, fn) {
		return this.moveTo({
			x: fn(this.x, typeof arg == 'object' ? arg.x : arg),
			y: fn(this.y, typeof arg == 'object' ? arg.y : arg)
		});
	},
	mul : function (arg) {
		return this.alterPos(arg, function(a, b) {
			return a * b;
		});
	},
	getNeighbour : function (dir) {
		return this.clone().move(shifts[dir]);
	},
	movingInterval: 0,
	animateMoveTo : function (to, speed) {
		this.movingInterval.stop();
		this.movingInterval = function () {
			var move = {}, pixelsPerFn = speed / 20;
			var diff = this.diff(to);
			var dist = this.distanceTo(to);
			if (dist > pixelsPerFn) {
				move.x = diff.x * (pixelsPerFn / dist);
				move.y = diff.y * (pixelsPerFn / dist);
			} else {
				move.x = diff.x;
				move.y = diff.y;
				this.movingInterval.stop();
				this.bind('stopMove');
			}
			this.move(move);
		}.periodical(20, this);
		return this;
	},
	equals : function (to, accuracy) {
		to = Point.from(to);
		return (arguments.length < 2) ? (to.x == this.x && to.y == this.y) :
			(this.x.equals(to.x, accuracy) && this.y.equals(to.y, accuracy));
	},
	clone : function () {
		return new Point(this);
	}
});

})();

/*
---

name: "Inner.MouseEvents"

description: "Class which contains several basic mouse events "

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point

provides: Inner.MouseEvents

...
*/

LibCanvas.namespace('Inner').MouseEvents = atom.Class({
	subscribers : [],
	lastMouseMove : [],
	lastMouseDown : [],
	initialize : function (mouse) {
		this.mouse = mouse;
		this.point = mouse.point;
	},
	subscribe : function (elem) {
		this.subscribers.include(elem);
		return this;
	},
	unsubscribe : function (elem) {
		this.subscribers.erase(elem);
		return this;
	},
	overElem : function (elem) {
		return this.mouse.inCanvas && elem.getShape().hasPoint(this.point);
	},
	getOverSubscribers : function () {
		var elements = {
			over : [],
			out  : []
		};
		var maxOverMouseZ = 0, sub = this.subscribers.sortBy('getZIndex');
		for (var i = 0, l = sub.length; i < l; i++) {
			var elem = sub[i];
			if (elem.getZIndex() >= maxOverMouseZ && this.overElem(elem)) {
				maxOverMouseZ = elem.getZIndex();
				elements.over.push(elem);
			} else {
				elements.out.push(elem);
			}
		}
		return elements;
	},
	fireEvent : function (elem, event, e) {
		elem.bind(event, [event, e]);
	},
	event : function (type, e) {
		var mouse = this, subscribers = this.getOverSubscribers();

		if (type == 'mousedown') mouse.lastMouseDown.empty();
		
		subscribers.over.forEach(function (elem) {
			// Mouse move firstly on this element
			if (type == 'mousemove' && !mouse.lastMouseMove.contains(elem)) {
				mouse.fireEvent(elem, 'mouseover', e);
				mouse.lastMouseMove.push(elem);
			} else if (type == 'mousedown') {
				mouse.lastMouseDown.push(elem);
			// If mousepe on this elem and last mousedown was on this elem - click
			} else if (type == 'mouseup' && mouse.lastMouseDown.contains(elem)) {
				mouse.fireEvent(elem, 'click', e);
			}
			mouse.fireEvent(elem, type, e);
		});

		subscribers.out.forEach(function (elem) {
			// if (this.isOut) mouse.fireEvent(elem, 'away:mouseover', e);
			var mouseout = false;
			if (['mousemove', 'mouseout'].contains(type)) {
				if (mouse.lastMouseMove.contains(elem)) {
					mouse.fireEvent(elem, 'mouseout', e);
					if (type == 'mouseout') mouse.fireEvent(elem, 'away:mouseout', e);
					mouse.lastMouseMove.erase(elem);
					mouseout = true;
				}
			}
			if (!mouseout) mouse.fireEvent(elem, 'away:' + type, e);
		});

		return this;
	}
});

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
	initialize : function (libcanvas) {
		this.inCanvas = false;
		this.point = new LibCanvas.Point();

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

/*
---

name: "Behaviors.MouseListener"

description: "Canvas mouse listener"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Mouse

provides: Behaviors.MouseListener

...
*/

/**
 * Available such events :
 *
 * click
 *
 * mouseover
 * mousemove
 * mouseout
 * mouseup
 * mousedown
 *
 * away:mouseover
 * away:mousemove
 * away:mouseout
 * away:mouseup
 * away:mousedown
 */

// Should extends LibCanvas.Behaviors.Drawable
LibCanvas.namespace('Behaviors').MouseListener = atom.Class({
	listenMouse : function (stopListen) {
		return this.bind('libcanvasSet', function () {
			this.libcanvas.mouse[
				stopListen ? "unsubscribe" : "subscribe"
			](this);
		}.context(this));
	}
});

/*
---

name: "Behaviors.Clickable"

description: "Provides interface for clickable canvas objects"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Bindable
	- Behaviors.MouseListener

provides: Behaviors.Clickable

...
*/

(function () {

var setValFn = function (name, val) {
	return function () {
		this[name] = val;
		this.bind('statusChanged');
	}.context(this);
};

// Should extends drawable, implements mouseListener
LibCanvas.namespace('Behaviors').Clickable = atom.Class({
	clickable : function () { 
		this.listenMouse();

		var fn = setValFn.context(this);

		this.hover  = false;
		this.active = false;

		this.bind('mouseover', fn('hover', true));
		this.bind('mouseout' , fn('hover', false));
		this.bind('mousedown', fn('active', true));
		this.bind(['mouseup', 'away:mouseout', 'away:mouseup'],
			fn('active', false));
		return this;
	}
});
})();

/*
---

name: "Behaviors.Draggable"

description: "When object implements LibCanvas.Behaviors.Draggable interface dragging made possible"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Bindable
	- Behaviors.MouseListener

provides: Behaviors.Draggable

...
*/

(function () {

LibCanvas.namespace('Behaviors').Draggable = atom.Class({
	isDraggable : null,
	dragStart : null,
	returnToStart : function (speed) {
		return !this.dragStart ? this : this.moveTo(this.dragStart, speed);
	},
	draggable : function (stopDrag) {
		if (this.isDraggable === null) {
			this.bind('libcanvasSet', initDraggable.bind(this));
		}
		this.isDraggable = !stopDrag;
		return this;
	}
});

var moveListener = function () {
	if (this.isDraggable && this.prevMouseCoord) {
		var mouse = this.libcanvas.mouse;
			var move  = this.prevMouseCoord.diff(mouse.point);
		this.shape.move(move);
		this.bind('moveDrag', [move]);
		this.prevMouseCoord.set(mouse.point)
	}
};

var initDraggable = function () {
	var dragFn = moveListener.context(this);

	this.listenMouse();

	var startDrag = ['mousedown'];
	var dragging  = ['mousemove', 'away:mousemove'];
	var stopDrag  = ['mouseup', 'away:mouseup', 'away:mouseout'];

	return this
		.bind(startDrag, function () {
			if (this.isDraggable) {
				this.bind('startDrag');
				if (this.getCoords) this.dragStart = this.getCoords().clone();
				this.prevMouseCoord = this.libcanvas.mouse.point.clone();
				this.bind(dragging, dragFn);
			}
		})
		.bind(stopDrag, function () {
			if (this.isDraggable && this.prevMouseCoord) {
				this.bind('stopDrag').unbind(dragging, dragFn);
				delete this.prevMouseCoord;
			}
		});
};

})();

/*
---

name: "Behaviors.Drawable"

description: "Abstract class for drawable canvas objects"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Bindable

provides: Behaviors.Drawable

...
*/

LibCanvas.namespace('Behaviors').Drawable = atom.Class({
	Implements: [LibCanvas.Behaviors.Bindable],
	setLibcanvas : function (libcanvas) {
		this.libcanvas = libcanvas;
		this.autoBind('libcanvasSet');
		this.libcanvas.bind('ready', this.autoBind.bind(this, 'libcanvasReady'));
		return this;
	},
	getCoords : function () {
		return this.shape.getCoords();
	},
	getShape : function () {
		return this.shape;
	},
	setShape : function (shape) {
		this.shape = shape;
		return this;
	},
	getZIndex : function () {
		return this.zIndex || 0;
	},
	setZIndex : function (zIndex) {
		this.zIndex = zIndex;
		return this;
	},
	draw : atom.Class.abstractMethod
});

/*
---

name: "Behaviors.Droppable"

description: "Abstract class for droppable canvas objects"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Bindable
	- Behaviors.MouseListener
	- Behaviors.Draggable

provides: Behaviors.Droppable

...
*/

LibCanvas.namespace('Behaviors').Droppable = atom.Class({
	drops : null,
	drop : function (obj) {
		if (this.drops === null) {
			this.drops = [];
			this.bind('stopDrag', function () {
				var dropped = false;
				var mouse = this.libcanvas.mouse;
				if (mouse.inCanvas) {
					this.drops.forEach(function (obj) {
						if(obj.getShape().hasPoint(mouse.point)) {
							dropped = true;
							this.bind('dropped', [obj]);
						}
					}.context(this));
				}
				if (!dropped) this.bind('dropped', [null]);
			}.context(this));
		}
		this.drops.push(obj);
		return this;
	},
	undrop : function (obj) {
		if (this.drops !== null) this.drops.erase(obj);
		return this;
	}
});

/*
---

name: "Behaviors.Linkable"

description: "Made possible link between two canvas objects"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Bindable

provides: Behaviors.Linkable

...
*/

LibCanvas.namespace('Behaviors').Linkable = atom.Class({
	links : null,
	moveLinks : function (move) {
		(this.links || []).forEach(function (elem) {
			elem.getShape().move(move);
		});
		return this;
	},
	// todo : fix recursion while linkin 2 elements between each other
	link : function (obj) {
		if (this.links === null) {
			this.links = [];
			this.getShape().bind('move',
				this.moveLinks.context(this)
			);
		}
		this.links.include(obj);
		return this;
	},
	unlink : function (obj) {
		if (this.links !== null) {
			if (obj) this.links.erase(obj);
			else this.links = [];
		}
		return this;
	}
});

/*
---

name: "Behaviors.Moveable"

description: "Provides interface for moveable objects"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Bindable

provides: Behaviors.Moveable

...
*/

LibCanvas.namespace('Behaviors').Moveable = atom.Class({
	moving : {
		interval : 0,
		speed : 0, // pixels per sec
		to : null
	},
	stopMoving : function () {
		this.moving.interval.stop();
		return this;
	},
	getCoords : function () {
		return this.shape.getCoords();
	},
	moveTo    : function (point, speed) {
		this.stopMoving();
		this.moving.speed = speed = (speed || this.moving.speed);
		if (!speed) {
			this.getShape().move(this.getCoords().diff(point));
			return this;
		}
		this.moving.interval = function () {
			var move = {}, pixelsPerFn = speed / 20;
			var diff = this.getCoords().diff(point);
			var distance = Math.hypotenuse(diff.x, diff.y);
			if (distance > pixelsPerFn) {
				move.x = diff.x * (pixelsPerFn / distance);
				move.y = diff.y * (pixelsPerFn / distance);
				this.getShape().move(move);
			} else {
				this.getShape().move(diff);
				this.stopMoving();
				this.bind('stopMove');
			}
		}.periodical(20, this);
		return this;
	}
});

/*
---

name: "Animation"

description: "Provides basic animation for sprites"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Bindable

provides: Animation

...
*/

LibCanvas.Animation = atom.Class({
	Implements: [LibCanvas.Behaviors.Bindable],
	sprites : {},
	addSprite : function (index, sprite) {
		this.sprites[index] = sprite;
		return this;
	},
	addSprites : function (sprites) {
		atom.extend(this.sprites, sprites);
		return this;
	},
	defaultSprite : null,
	setDefaultSprite : function (index) {
		this.defaultSprite = index;
		return this;
	},
	getSprite : function () {
		return this.getFrame() ? this.sprites[this.getFrame().sprite] : 
			Object.isReal(this.defaultSprite) ? this.sprites[this.defaultSprite] : null;
	},

	animations : {},
	add : function (animation) {
		if (!animation.frames && animation.line) {
			animation.frames = [];
			animation.line.forEach(function (f) {
				animation.frames.push({sprite : f, delay : animation.delay});
			});
			delete animation.line;
			return this.add(animation);
		}
		this.animations[animation.name] = animation;
		return this;
	},

	current : null,
	queue : [],
	run : function (name, cfg) {
		if (!name in this.animations) {
			throw new Error('No animation "' + name + '"');
		}
		var args = {
			name : name,
			cfg  : cfg || {}
		};
		if (this.current) {
			this.queue.push(args);
		} else {
			this.init(args);
		}
		return this;
	},
	stop : function (force) {
		this.current = null;
		if (force) {
			this.queue = [];
		} else {
			this.stopped();
		}
		return this;
	},
	stopped : function () {
		var next = this.queue.shift();
		return Object.isReal(next) && this.init(next);
	},
	init : function (args) {
		this.current = {
			animation : this.animations[args.name],
			index     : -1,
			cfg       : args.cfg
		};
		this.current.repeat = this.getCfg('repeat');
		return this.nextFrame();
	},
	nextFrame : function () {
		if (!this.current) {
			return this;
		}
		this.current.index++;
		var frame = this.getFrame();
		if (!frame && (this.getCfg('loop') || this.current.repeat)) {
			this.current.repeat && this.current.repeat--;
			this.current.index = 0;
			frame = this.getFrame();
		}
		var aniName = this.current.animation.name;
		if (frame) {
			var frameName = frame.name ? 'frame:' + frame.name : 'frame';
			this.bind('changed', [frameName, aniName]);
			this.bind(frameName, [frameName, aniName]);
			Object.isReal(frame.delay) && this.nextFrame.bind(this).delay(frame.delay);
		} else {
			this.bind('changed', ['stop:' + aniName]);
			this.bind('stop:' + aniName, ['stop:' + aniName]);
			this.bind('stop', [aniName]);
			this.current = null;
			this.stopped();
		}
		return this;
	},
	getFrame : function () {
		return !this.current ? null :
			this.current.animation.frames[this.current.index];
	},
	getCfg : function (index) {
		if (index in this.current.cfg) {
			return this.current.cfg[index];
		} else {
			return this.current.animation[index]
		}
	}
});


/*
---

name: "Inner.FrameRenderer"

description: "Private class for inner usage in LibCanvas.Canvas2D"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point

provides: Inner.FrameRenderer

...
*/

LibCanvas.namespace('Inner').FrameRenderer = atom.Class({
	checkAutoDraw : function () {
		if (this.autoUpdate == 'onRequest') {
			if (this.updateFrame) {
				this.updateFrame = false;
				return true;
			}
		} else if (this.autoUpdate) return true;
		return false;
	},
	callFrameFn : function () {
		if (this.fn) this.fn.call(this);
		return this;
	},
	show : function () {
		this.origCtx.clearAll().drawImage(this.elem);
		return this;
	},
	drawAll : function () {
		var elems = this.elems.sortBy('getZIndex');
		for (var i = elems.length; i--;) elems[i].draw();
		return this;
	},
	processing : function (type) {
		this.processors[type].forEach(function (processor) {
			if ('process' in processor) {
				processor.process(this);
			} else if ('processCanvas' in processor) {
				processor.processCanvas(this.elem);
			} else if ('processPixels' in processor) {
				this.ctx.putImageData(
					processor.processCanvas(
						this.ctx.getImageData()
					)
				);
			}
		}.context(this));
		return this;
	},
	nextFrame : function (time) {
		this.nft || (this.nft = new LibCanvas.Utils.Trace());

		time = Math.max(time, 1000 / this.fps);

		this.nft.trace((1000 / time).round());
		this.frame.bind(this, time).delay(184);
	},
	frameTime : [0],
	frame : function (time) {
		this.nextFrame(this.frameTime.average());

		var startTime = Date.now();
			this.bind('frameRenderStarted');
			this.funcs
				.sortBy('priority', true)
				.invoke(this, time);
			var render = this.renderFrame();
			this.bind('frameRenderFinished');
		var lastFrameTime = Date.now() - startTime;

		// if no render in this frame - take last rendered frame time
		if (render) {
			this.frameTime.push(lastFrameTime);
			if (this.frameTime.length > 10) {
				this.frameTime.shift();
			}
		}
		return this;
	},
	renderFrame : function () {
		if (this.checkAutoDraw()) {
			this.processing('pre');

			this.isReady() ?
				this.callFrameFn().drawAll() :
				this.renderProgress();
			this.processing('post');
			if (this.elem != this.origElem) this.show();
			return true;
		}
		return false;
	}
});

/*
---

name: "Utils.FpsMeter"

description: "Provides FPS indicator"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Utils.Trace

provides: Utils.FpsMeter

...
*/

LibCanvas.namespace('Utils').FpsMeter = atom.Class({
	initialize : function (framesMax) {
		this.trace = new LibCanvas.Utils.Trace();
		this.genTime   = [];
		this.prevTime  = null;
		this.framesMax = framesMax;
	},
	frame : function () {
		if (this.prevTime) {
			this.genTime.push(Date.now() - this.prevTime);
			if (this.genTime.length > this.framesMax) {
				this.genTime.shift();
			}
		}
		this.output();
		this.prevTime = Date.now();
		return this;
	},
	output : function () {
		if (this.genTime.length) {
			var fps = 1000 / this.genTime.average();
			fps = fps.round(fps > 2 ? 0 : fps > 1 ? 1 : 2);
			this.trace.trace('FPS: ' + fps);
		} else {
			this.trace.trace('FPS: counting');
		}
		return this;
	}
});

/*
---

name: "Inner.FpsMeter"

description: "Constantly calculates frames per seconds rate"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Utils.FpsMeter

provides: Inner.FpsMeter

...
*/
LibCanvas.namespace('Inner').FpsMeter = atom.Class({
	fpsMeter : function (frames) {
		var fpsMeter = new LibCanvas.Utils.FpsMeter(frames || (this.fps ? this.fps / 2 : 10));
		return this.bind('frameRenderStarted', function () {
			fpsMeter.frame();
		});
	}
});

/*
---

name: "Shape"

description: "Abstract class LibCanvas.Shape defines interface for drawable canvas objects"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Geometry
	- Point

provides: Shape

...
*/

LibCanvas.Shape = atom.Class({
	Extends : LibCanvas.Geometry,
	set     : atom.Class.abstractMethod,
	hasPoint: atom.Class.abstractMethod,
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	},
	// Методы ниже рассчитывают на то, что в фигуре есть точки from и to
	getCoords : function () {
		return this.from;
	},
	move : function (distance, reverse) {
		distance = this.invertDirection(distance, reverse);
		reverse = false;
		this.from.move(distance, reverse);
		this. to .move(distance, reverse);
		return this.parent(distance, reverse);
	},
	equals : function (shape) {
		return shape.from.equals(this.from) && shape.to.equals(this.to);
	},
	clone : function () {
		return new this.self(this.from.clone(), this.to.clone());
	},
	getPoints : function () {
		return { from : this.from, to : this.to };
	}
});

/*
---

name: "Shapes.Rectangle"

description: "Provides rectangle as canvas object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Rectangle

...
*/

new function () {

var Point = LibCanvas.Point,
	math = Math,
	min = math.min,
	max = math.max,
	isReal = Object.isReal,
	random = Number.random;

LibCanvas.namespace('Shapes').Rectangle = atom.Class({
	Extends: LibCanvas.Shape,
	set : function () {
		var a = Array.pickFrom(arguments);

		if (a.length == 4) {
			this.from = new Point(a[0], a[1]);
			this.to   = this.from.clone().move({x:a[2], y:a[3]});
		} else if (a.length == 2) {
			this.from = Point.from(a[0]);
			this.to   = Point.from(a[1]);
		} else {
			a = a[0];
			if (a.from) {
				this.from = Point.from(a.from);
			} else if ('x' in a && 'y' in a) {
				this.from = new Point(a.x, a.y);
			}
			if (a.to) this.to = Point.from(a.to);
		
			if (!a.from || !a.to) {
				var as = a.size, size = {
					x : (as ? [as.w, as[0], as.width ] : [ a.w, a.width  ]).pick(),
					y : (as ? [as.h, as[1], as.height] : [ a.h, a.height ]).pick()
				};
				this.from ?
					(this.to = this.from.clone().move(size, 0)) :
					(this.from = this.to.clone().move(size, 1));
			}
		
		}
		return this;
	},

	getWidth : function () {
		return this.to.x - this.from.x;
	},
	getHeight : function () {
		return this.to.y - this.from.y;
	},
	setWidth : function (width) {
		this.to.moveTo({ x : this.from.x + width, y : this.to.y });
		return this;
	},
	setHeight : function (height) {
		this.to.moveTo({ x : this.to.x, y : this.from.y + height });
		return this;
	},
	hasPoint : function (point) {
		point = Point.from(arguments);
		return point.x != null && point.y != null
			&& point.x.between(min(this.from.x, this.to.x), max(this.from.x, this.to.x), 1)
			&& point.y.between(min(this.from.y, this.to.y), max(this.from.y, this.to.y), 1);
	},
	draw : function (ctx, type) {
		// fixed Opera bug - cant drawing rectangle with width or height below zero
		ctx.original(type + 'Rect', [
			min(this.from.x, this.to.x),
			min(this.from.y, this.to.y),
			this.getWidth() .abs(),
			this.getHeight().abs()
		]);
		return this;
	},
	getCenter : function () {
		return new Point(
			(this.from.x + this.to.x) / 2,
			(this.from.y + this.to.y) / 2
		);
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		ctx
			.moveTo(this.from.x, this.from.y)
			.lineTo(this.to.x, this.from.y)
			.lineTo(this.to.x, this.to.y)
			.lineTo(this.from.x, this.to.y)
			.lineTo(this.from.x, this.from.y);
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	getRandomPoint : function (margin) {
		margin = margin || 0;
		return new Point(
			random(margin, this.getWidth()  - margin),
			random(margin, this.getHeight() - margin)
		);
	},
	translate : function (point, fromRect) {
		var diff = fromRect.from.diff(point);
		return new Point({
			x : (diff.x / fromRect.getWidth() ) * this.getWidth(),
			y : (diff.y / fromRect.getHeight()) * this.getHeight()
		});
	}
});

}();

/*
---

name: "Utils.ImagePreloader"

description: "Provides images preloader"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Shapes.Rectangle

provides: Utils.ImagePreloader

...
*/

LibCanvas.namespace('Utils').ImagePreloader = atom.Class({
	count : {
		errors : 0,
		aborts : 0,
		loaded : 0
	},
	images : {},
	processed : 0,
	number: 0,
	initialize: function (images) {
		this.createImages(images);
		this.readyfuncs = [];
	},
	onProcessed : function (type) {
		this.count[type]++;
		this.processed++;
		if (this.isReady()) this.readyfuncs.invoke(this, this);
		return this;
	},
	getInfo : function () {
		var stat = "Images loaded: {loaded}; Errors: {errors}; Aborts: {aborts}"
			.substitute(this.count);
		var ready = this.isReady() ? "Image preloading has completed;\n" : '';
		return ready + stat;
	},
	getProgress : function () {
		return this.isReady() ? 1 : (this.processed / this.number).round(3);
	},
	isReady : function () {
		return (this.number == this.processed);
	},
	createEvent : function (type) {
		return this.onProcessed.context(this, [type]);
	},
	createImage : function (src, key) {
		this.number++;
		return this.images[key] = atom()
			.create('img', { src : src })
			.bind({
				load  : this.createEvent('loaded'),
				error : this.createEvent('errors'),
				abort : this.createEvent('aborts')
			});
	},
	createImages : function (images) {
		var imgs = {};
		for (var i in images) imgs[i] = this.createImage(imgs[i], i);
		return imgs;
	},
	ready : function (fn) {
		this.isReady() ? fn(this) : this.readyfuncs.push(fn);
		return this;
	}
});

/*
---

name: "Utils.ProgressBar"

description: "Easy way to draw progress bar"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shapes.Rectangle,
	- Shapes.Polygon,

provides: Utils.ProgressBar

...
*/

new function () {

var LibCanvas = window.LibCanvas,
	Buffer    = LibCanvas.Buffer,
	Rectangle = LibCanvas.Shapes.Rectangle,
	Polygon   = LibCanvas.Shapes.Polygon,
	Point     = LibCanvas.Point;

LibCanvas.namespace('Utils').ProgressBar = atom.Class({
	initialize : function () {
		this.coord = new Point;
		this.progress = 0;
	},
	preRender : function () {
		if (this.libcanvas && this.style) {
			var htmlElem = this.libcanvas.ctx.canvas;
			this.coord.set(
				(htmlElem.width -this.style['width'] )/2,
				(htmlElem.height-this.style['height'])/2
			);
			this.line = this.renderLine();
		}
		return this;
	},
	setLibcanvas : function (libcanvas) {
		this.libcanvas = libcanvas;
		return this.preRender();
	},
	getBuffer : function () {
		if (!this.buffer) this.buffer = Buffer(this.style.width, this.style.height, true).ctx;
		return this.buffer;
	},
	drawBorder : function () {
		var s = this.style;
		
		var pbRect = new Rectangle({
			from : this.coord,
			size : Object.collect(s, ['width', 'height'])
		});

		this.libcanvas.ctx
			.fillAll(s['bgColor'])
			.fill   (pbRect, s['barBgColor'])
			.stroke (pbRect, s['borderColor']);
		return this;
	},
	drawLine : function () {
		if (this.progress > 0) {
			var line = this.line;
			var width  = line.width  - 2;
			var height = line.height - 2;
			var prog   = this.progress;
			var c = this.coord;

			this.libcanvas.ctx.drawImage({
				image : line,
				crop  : [0, 0 , width * prog, height],
				draw  : [c.x+1, c.y+1, width * prog, height]
			});
		}
		return this;
	},
	renderLine : function () {
		var b = this.getBuffer(), s = this.style;

		// Закрашиваем фон
		b.save().fillAll(s['barColor']);

		// Если нужны полоски - рисуем
		if (s['strips']) {
			b.set('fillStyle', s['stripColor']);
			// Смещение верхней части полоски относительно нижней
			var shift = 1 * s['stripShift'] || 0, stripW = 1*s['stripWidth'];
			var w = b.canvas.width, h = b.canvas.height;
			// Рисуем их по очереди , пока на холсте есть место
			for(var mv = 1; mv < w; mv += s['stripStep']) {
				b.fill(new Polygon([
					[mv + shift         , 0 ],
					[mv + shift + stripW, 0 ],
					[mv         + stripW, h ],
					[mv                 , h ]
				]));
			}
		}

		// Добавляем поверх линию, если необходимо
		if (s['blend']) {
			b.set({
				globalAlpha: s['blendOpacity'] < 1 ? s['blendOpacity'] : 0.3,
				fillStyle  : s['blendColor']
			})
			.fillRect({
				from : [ 0             , s['blendVAlign'] ],
				size : [ b.canvas.width, s['blendHeight'] ]
			});
		}
		return b.restore().canvas;
	},
	setProgress : function (progress) {
		if (this.libcanvas) this.libcanvas.update();
		this.progress = progress;
		return this;
	},
	setStyle : function (newStyle) {
		if (this.libcanvas) this.libcanvas.update();
		this.style = newStyle;
		return this.preRender();
	},
	draw : function () {
		this.libcanvas.ctx.save();
		this.drawBorder().drawLine();
		this.libcanvas.ctx.restore();
		return this;
	}
});

}();

/*
---

name: "Inner.DownloadingProgress"

description: "Counting assets downloading progress"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Utils.ImagePreloader
	- Utils.ProgressBar

provides: Inner.DownloadingProgress

...
*/
LibCanvas.namespace('Inner').DownloadingProgress = atom.Class({
	preloadImages : null,
	progressBarStyle : null,
	getImage : function (name) {
		if (this.images && this.images[name]) {
			return this.images[name];
		} else {
			throw new Error('No image «' + name + '»');
		}
	},
	renderProgress : function () {
		if (!this.imagePreloader) {
			this.imagePreloader = new LibCanvas.Utils.ImagePreloader(this.preloadImages)
				.ready(function (preloader) {
					this.images = preloader.images;
					atom.log(preloader.getInfo());
					this.autoBind('ready');
					this.update();
				}.context(this));
		}
		if (this.progressBarStyle && !this.progressBar) {
			this.progressBar = new LibCanvas.Utils.ProgressBar()
				.setStyle(this.progressBarStyle);
		}
		if (this.progressBar) {
			this.progressBar
				.setLibcanvas(this)
				.setProgress(this.imagePreloader.getProgress())
				.draw();
		}
	},
	isReady : function () {
		return !this.preloadImages || (this.imagePreloader && this.imagePreloader.isReady());
	}
});

/*
---

name: "Canvas2D"

description: "LibCanvas.Canvas2D wraps around native <canvas>."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Context2d
	- Inner.FrameRenderer
	- Inner.FpsMeter
	- Inner.DownloadingProgress
	- Behaviors.Bindable

provides: Canvas2D

...
*/

LibCanvas.Canvas2D = atom.Class({
	Extends: LibCanvas,
	Implements: [
		LibCanvas.Inner.Canvas2D.FrameRenderer,
		LibCanvas.Inner.Canvas2D.FpsMeter,
		LibCanvas.Inner.Canvas2D.DownloadingProgress,
		LibCanvas.Behaviors.Bindable
	],

	fps        : 1,
	autoUpdate : true,
	interval   : null,

	initialize : function (elem, cfg) {
		if (typeof elem == 'string') elem = atom(elem);
		if (atom.isAtom(elem)) elem = elem.get();

		this.origElem = elem;
		this.origCtx  = elem.getContext('2d-libcanvas');

		if (cfg && cfg.backBuffer == 'off') {
			this.elem = this.origElem;
			this.ctx  = this.origCtx;
		} else {
			this.elem = this.createBuffer();
			this.ctx  = this.elem.getContext('2d-libcanvas');
		}

		this.update = this.update.context(this);
	},

	updateFrame : true,
	update : function () {
		if (this.autoUpdate == 'onRequest') {
			this.updateFrame = true;
		} else {
			this.frame();
		}
		return this;
	},

	mouse : null,
	listenMouse : function (elem) {
		this.mouse = LibCanvas.isLibCanvas(elem) ? elem.mouse
			: new LibCanvas.Mouse(this, /* preventDefault */elem);
		return this;
	},
	keyboard: null,
	getKey : function (key) {
		return this.keyboard.keyState(key);
	},
	listenKeyboard : function (elem) {
		this.keyboard = LibCanvas.isLibCanvas(elem) ? elem.keyboard
			: new LibCanvas.Keyboard(this, /* preventDefault */elem);
		return this;
	},
	createBuffer : function (width, height) {
		return LibCanvas.Buffer.apply(
			LibCanvas, arguments.length ? arguments :
				Array.collect(this.origElem, ['width', 'height'])
		);
	},
	createGrip : function (config) {
		var grip = new LibCanvas.Ui.Grip(this, config);
		this.addElement(grip);
		return grip;
	},

	// post-/pre- procesing
	processors : { pre: [], post: [] },
	addProcessor : function (type, processor) {
		this.processors[type].push(processor);
		return this;
	},
	rmProcessor : function (type, processor) {
		this.processors[type].erase(processor);
		return this;
	},

	// Element : add, rm
	elems : [],
	addElement : function (elem) {
		this.elems.include(elem.setLibcanvas(this));
		return this;
	},
	rmElement : function (elem) {
		this.elems.erase(elem);
		return this;
	},

	// Each frame funcs
	funcs : [],
	addFunc : function (fn, priority) {
		fn.priority = priority || 10;
		this.funcs.include(fn);
		return this;
	},
	rmFunc : function (fn) {
		this.funcs.erase(fn);
		return this;
	},

	// Start, pause, stop
	start : function (fn) {
		this.fn = fn;
		this.frame();
		return this;
	}
});

/*
---

name: "Shapes.Circle"

description: "Provides circle as canvas object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Circle

...
*/

new function () {

var Point = LibCanvas.Point;
	
LibCanvas.namespace('Shapes').Circle = atom.Class({
	Extends: LibCanvas.Shape,
	set : function () {
		var a = Array.pickFrom(arguments);

		if (a.length >= 3) {
			this.center = new Point(a[0], a[1]);
			this.radius = a[2];
		} else if (a.length == 2) {
			this.center = Point.from(a[0]);
			this.radius = a[1];
		} else {
			a = a[0];
			this.radius = [a.r, a.radius].pick();
			if ('x' in a && 'y' in a) {
				this.center = new Point(a[0], a[1]);
			} else if ('center' in a) {
				this.center = Point.from(a.center);
			} else if ('from' in a) {
				this.center = new Point(a.from).move({
					x: this.radius,
					y: this.radius
				});
			}
		}
		if (!this.center) throw new TypeError('Wrong Arguments In Circle: Center is null');
		if (!Object.isReal(this.radius))
			throw new TypeError('Wrong Arguments In Circle: Radius is null');
	},
	getCoords : function () {
		return this.center;
	},
	hasPoint : function (point) {
		point = Point.from(arguments);
		return this.center.distanceTo(point) <= this.radius;
	},
	scale : function (factor) {
		this.center.scale(factor);
		return this;
	},
	intersect : function (obj) {
		if (obj instanceof this.self) {
			return this.center.distanceTo(obj.center) < this.radius + obj.radius;
		}
		return false;
	},
	move : function (distance) {
		this.center.move(distance);
		return this.parent(distance);
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		ctx.arc({
			circle : this,
			angle  : [0, (360).degree()]
		});
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	clone : function () {
		return new this.self(this.center.clone(), this.radius);
	},
	getPoints : function () {
		return { center : this.center };
	}
});

}();

/*
---

name: "Context2D"

description: "LibCanvas.Context2D adds new canvas context '2d-libcanvas'"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shapes.Rectangle
	- Shapes.Circle

provides: Context2D

...
*/

(function () {

var LibCanvas = window.LibCanvas,
	Point     = LibCanvas.Point,
	Shapes    = LibCanvas.namespace('Shapes'),
	Rectange  = Shapes.Rectangle,
	Circle    = Shapes.Circle;


var office = {
	all : function (type, style) {
		this.save();
		if (style)  this.set(type + 'Style', style);
		this[type + 'Rect'](this.getFullRectangle());
		this.restore();
		return this;
	},
	rect : function (func, args) {
		var rect = office.makeRect.call(this, args);
		
		return this.original(func,
			[rect.from.x, rect.from.y, rect.getWidth(), rect.getHeight()]);
	},
	makeRect: function (args) {
		return args.length ?
			Rectangle.from(args) :
			this.getFullRectangle();
	},
	fillStroke : function (type, args) {
		if (args.length >= 1 && args[0] instanceof LibCanvas.Shape) {
			if (args[1]) this.save().set(type + 'Style', args[1]);
			args[0].draw(this, type);
			if (args[1]) this.restore();
		} else {
			if (args.length && args[0]) this.save().set(type + 'Style', args[0]);
			this.original(type);
			if (args.length && args[0]) this.restore();
		}
		
		return this;
	},
	originalPoint : function (func, args) {
		var point = Point.from(args);
		return this.original(func, [point.x, point.y]);
	},
	createImageCacheData : function (a) {
		var draw = Rectangle.from(a.draw);
		var crop = a.crop ? Rectangle.from(a.crop) : null;
		return {
			src : a.image.getAttribute('src') || '',
			image : a.image,
			crop : crop ? {
				x : crop.from.x,
				y : crop.from.y,
				w : crop.getWidth(),
				h : crop.getHeight()
			} : null,
			draw : {
				x : 0,
				y : 0,
				w : draw.getWidth(),
				h : draw.getHeight()
			}
		};
	},
	getImageCache : function (data) {
		var src = imageCache[data.src];
		if (src) for (var i = src.length; i--;) {
			if (Array.deepEquals(src[i].data, data)) {
				return src[i].cache;
			}
		}
		return false;
	},
	putImageCache : function (data, cache) {
		data = office.createImageCacheData(data);
		var src = imageCache[data.src];
		if (!src) src = imageCache[data.src] = [];
		src.push({
			data  : data,
			cache : cache
		});
	},
	getRotatedImageCache : function (data, length) {
		var index = data.angle
			.normalizeAngle()
			.getDegree()
			.toFixed(length);
		var cache = rotatedImageCache[index];
		if (cache) {
			for (var i = cache.length; i--;) {
				if (cache[i].image == data.image) {
					return cache[i].cache;
				}
			}
		}
		return null;
	},
	putRotatedImageCache : function (data, cache, length) {
		var index = data.angle
			.normalizeAngle()
			.getDegree()
			.toFixed(length);
		if (!rotatedImageCache[index]) {
			rotatedImageCache[index] = [];
		}
		rotatedImageCache[index].push({
			image : data.image,
			cache : cache
		});
	}
};

var rotatedImageCache = {};
var imageCache = {};

LibCanvas.Context2D = atom.Class({
	initialize : function (canvas) {
		if (canvas instanceof CanvasRenderingContext2D) {
			this.ctx2d  = canvas;
			this.canvas = this.ctx2d.canvas;
		} else {
			this.canvas = canvas;
			this.ctx2d  = canvas.getOriginalContext('2d');
		}
		// todo : remove
		this.width  = this.canvas.width;
		this.height = this.canvas.height;
	},
	getFullRectangle : function () {
		return new Rectangle(0, 0, this.width, this.height);
	},
	original : function (method, args) {
		try {
			this.ctx2d[method].apply(this.ctx2d, args || []);
		} catch (e) {
			atom.log('Error in context2d.original(method, args)', method, args);
			throw e;
		}
		return this;
	},
	getClone : function (width, height) {
		var canvas = this.canvas, clone  = LibCanvas.Buffer(
			width  || canvas.width,
			height || canvas.height
		);
		var ctx = clone.getContext('2d');
		!arguments.length ? ctx.drawImage(canvas, 0, 0) :
			ctx.drawImage(canvas, 0, 0, width, height);
		return clone;
	},

	// All
	fillAll : function (style) {
		return office.all.call(this, 'fill', style);
	},
	strokeAll : function (style) {
		return office.all.call(this, 'stroke', style);
	},
	clearAll : function (style) {
		return office.all.call(this, 'clear', style);
	},

	// Save/Restore
	save : function () {
		return this.original('save');
	},
	restore : function () {
		return this.original('restore');
	},

	// Values
	set : function (name, value) {
		if (typeof name == 'object') {
			for (var i in name) this.set(i, name[i]);
			return this;
		}
		try {
			this.ctx2d[name] = value;
		} catch (e) {
			throw TypeError('Exception while setting «' + name + '» to «' + value + '»: ' + e.message);
		}
		return this;
	},
	get : function (name) {
		return this.ctx2d[name];
	},

	// Fill/Stroke
	fill : function (shape) {
		return office.fillStroke.call(this, 'fill', arguments);
	},
	stroke : function (shape) {
		return office.fillStroke.call(this, 'stroke', arguments);
	},

	// Path
	beginPath : function (moveTo) {
		var ret = this.original('beginPath');
		arguments.length && this.moveTo.apply(this, arguments);
		return ret;
	},
	closePath : function () {
		return this.original('closePath');
	},
	clip : function (shape) {
		if (shape && atom.typeOf(shape.processPath) == 'function') {
			shape.processPath(this);
		}
		return this.original('clip');
	},
	moveTo : function (point) {
		return office.originalPoint.call(this, 'moveTo', arguments);
	},
	lineTo : function (point) {
		return office.originalPoint.call(this, 'lineTo', arguments);
	},

	arc : function (x, y, r, startAngle, endAngle, anticlockwise) {
		var a = Array.pickFrom(arguments), circle, angle, acw;
		if (a.length > 1) {
			return this.original('arc', a);
		} else if ('circle' in a[0]) {
			circle = Circle.from(a[0].circle);
			angle  = Array.isArray(a[0].angle) ?
				a[0].angle.associate(['start', 'end']) :
				Object.collect(a[0].angle, ['start', 'end', 'size']);
			if (Array.isArray(angle)) {
				angle = angle.associate(['start', 'end']);
			} else if (angle.size != null) {
				if ('end' in angle) {
					angle.end = angle.size + angle.start;
				} else if ('start' in angle) {
					angle.start = angle.end - angle.size;
				}
			}
			acw = !!(a[0].anticlockwise || a[0].acw);
		} else {
			throw new TypeError('Wrong arguments in CanvasContext.arc');
		}
		return this.original('arc', [
			circle.center.x, circle.center.y, circle.radius, angle.start, angle.end, acw
		]);
	},

	arcTo : function () {
		// @todo Beauty arguments
		return this.original('arcTo', arguments);
	},
	quadraticCurveTo : function () {
		// @todo Beauty arguments
		return this.original('quadraticCurveTo', arguments);
	},
	bezierCurveTo : function () {
		var a = arguments;
		if (a.length == 6) {
			return this.original('bezierCurveTo', arguments);
		} else {
			a = a.length == 3 ? a.associate(['p1', 'p2', 'to']) : a[0];
			return this.original('bezierCurveTo', [
				a.p1.x, a.p1.y, a.p2.x, a.p2.y, a.to.x, a.to.y
			]);
		}
	},
	isPointInPath : function (x, y) {
		if (arguments.length == 2) {
			return this.ctx2d.isPointInPath(x, y);
		} else {
			var point = Point.from(x);
			return this.ctx2d.isPointInPath(point.x, point.y);
		}		
	},

	// transformation
	rotate : function (angle, point) {
		if (angle) {
			if (point) this.translate(point);
			this.ctx2d.rotate(angle);
			if (point) this.translate(point, true);
		}
		return this;
	},
	translate : function (point, reverse) {
		point = Point.from(
			(arguments.length === 1 || reverse === true)
				? point : arguments
		);
		var multi = reverse === true ? -1 : 1;
		this.ctx2d.translate(point.x * multi, point.y * multi);
		return this;
	},
	scale : function () {
		return office.originalPoint.call(this, 'scale', arguments);
	},
	transform : function () {
		// @todo Beauty arguments
		return this.original('transform', arguments);
	},
	setTransform : function () {
		// @todo Beauty arguments
		return this.original('setTransform', arguments);
	},

	// Rectangle
	fillRect : function (rectangle) {
		return office.rect.call(this, 'fillRect', arguments);
	},
	strokeRect : function (rectangle) {
		return office.rect.call(this, 'strokeRect', arguments);
	},
	clearRect : function (rectangle) {
		return office.rect.call(this, 'clearRect', arguments);
	},

	// text
	fillText : function (text, x, y, maxWidth) {
		// @todo Beauty arguments
		return this.original('fillText', arguments);
	},
	strokeText : function (text, x, y, maxWidth) {
		// @todo Beauty arguments
		return this.original('strokeText', arguments);
	},
	measureText : function (textToMeasure) {
		return this.ctx2d.measureText.apply(this.ctx2d, arguments);
	},
	text : function (cfg) {
		if (!this.ctx2d.fillText) return this;
		
		cfg = atom.extend({
			text   : '',
			color  : null, /* @color */
			wrap   : 'normal', /* no|normal */
			to     : null,
			align  : 'left', /* center|left|right */
			size   : 16,
			weigth : 'normal', /* bold|normal */
			style  : 'normal', /* italic|normal */
			family : 'sans-serif', /* @fontFamily */
			lineHeight : null,
			overflow   : 'visible', /* hidden|visible */
			padding : [0,0]
		}, cfg);
		this.save();
		var to = cfg.to ? Rectangle.from(cfg.to) : this.getFullRectangle();
		var lh = (cfg.lineHeight || (cfg.size * 1.15)).round();
		this.set('font', '{style}{weight}{size}px {family}'
			.substitute({
				style  : cfg.style == 'italic' ? 'italic ' : '',
				weight : cfg.weight == 'bold'  ? 'bold '   : '',
				size   : cfg.size,
				family : cfg.family
			})
		);
		if (cfg.color) this.set('fillStyle', cfg.color);
		if (cfg.overflow == 'hidden') this.clip(to);
		
		var xGet = function (lineWidth) {
			var al = cfg.align, pad = cfg.padding[1];
			return al == 'left'  ? to.from.x + pad :
			       al == 'right' ? to.to.x - lineWidth - pad :
			           to.from.x + (to.getWidth() - lineWidth)/2;
		};
		var x, lines = cfg.text.split('\n');
		var measure = function (text) {
			return this.measureText(text).width;
		}.context(this);
		if (cfg.wrap == 'no') {
			lines.forEach(function (line, i) {
				this.fillText(line, xGet(cfg.align == 'left' ? 0 : measure(line)), to.from.y + (i+1)*lh);
			}.context(this));
		} else {
			var lNum = 0;
			lines.forEach(function (line) {
				var words = line.match(/.+?(\s|$)/g);
				var L  = '';
				var Lw = 0;
				for (var i = 0; i <= words.length; i++) {
					var last = i == words.length;
					if (!last) {
						var text = words[i];
						// @todo too slow. 2-4ms for 50words
						var wordWidth = measure(text);
					}
					if (!last && (!Lw || Lw + wordWidth < to.getWidth())) {
						Lw += wordWidth;
						L  += text;
					} else if (Lw) {
						this.fillText(L, xGet(Lw), to.from.y + (++lNum)*lh + cfg.padding[0]);
						L  = '';
						Lw = 0;
					}
				}
				if (Lw) {
					this.fillText(L, xGet(Lw), to.from.y + (++lNum)*lh + cfg.padding[0]);
					L  = '';
					Lw = 0;
				}
			}.context(this));
			
		}
		return this.restore();
	},

	// image
	createImageData : function () {
		return this.original('createImageData', arguments);
	},
	cachedDrawImage : function (a) {
		if (!a.image || !a.draw) {
			return this.drawImage.apply(this, arguments);
		}
		var data = office.createImageCacheData(a);
		var cache = office.getImageCache(data);
		if (!cache) {
			// cache object
			cache = LibCanvas.Buffer(data.draw.w, data.draw.h);
			cache.getContext('2d-libcanvas')
				.drawImage(data);
			office.putImageCache(data, cache);
		}
		var draw = Rectangle.from(a.draw);
		var result = {
			image : cache,
			from  : draw.from
		};
		return this.drawImage(result);
	},
	rotatedImage : function (data, cacheLength) {
		var cacheEnabled = cacheLength !== false;
		cacheLength = (cacheLength * 1) || 0;
		if (!(data.angle.normalizeAngle().getDegree(3) % 360)) {
			return this.drawImage(data);
		}
		var cache = cacheEnabled && office.getRotatedImageCache(data, cacheLength);
		if (!cache) {
			var diagonal = Math.hypotenuse(data.image.width, data.image.height);
			cache = LibCanvas.Buffer(diagonal, diagonal);
			cache.getContext('2d-libcanvas')
				.translate(diagonal/2, diagonal/2)
				.rotate(data.angle)
				.drawImage(data.image, -data.image.width/2, -data.image.height/2);
			cacheEnabled && office.putRotatedImageCache(data, cache, cacheLength);
		}
		var from;
		if (data.center) {
			from = Point.from(data.center).clone().move({
				x : -cache.width /2,
				y : -cache.height/2
			});
		} else {
			from = Point.from(data.from).clone().move({
				x : from.x - (cache.width  - data.image.width )/2,
				y : from.y - (cache.height - data.image.height)/2
			});
		}
		return this.drawImage({
			image : cache,
			from  : from
		});

	},
	drawImage : function (a) {
		if (arguments.length > 1) return this.original('drawImage', arguments);
		if (atom.typeOf(a) == 'element') return this.original('drawImage', [a, 0, 0]);

		if (!a.image) throw new TypeError('No image');
		var center, from = a.center || a.from;

		this.save();
		if (from) {
			from = Point.from(from);
			if (a.center) from = {
				x : from.x - a.image.width/2,
				y : from.y - a.image.height/2
			};
			if (a.angle) {
				center = a.center || {
					x : from.x + a.image.width/2,
					y : from.y + a.image.height/2
				};
				this.rotate(a.angle, center);
			}
			this.original('drawImage', [
				a.image, from.x, from.y
			]);
		} else if (a.draw) {
			var draw = Rectangle.from(a.draw);
			if (a.angle) this.rotate(a.angle, draw.getCenter());

			if (a.crop) {
				var crop = Rectangle.from(a.crop);
				this.original('drawImage', [
					a.image,
					crop.from.x, crop.from.y, crop.getWidth(), crop.getHeight(),
					draw.from.x, draw.from.y, draw.getWidth(), draw.getHeight()
				]);
			} else {
				this.original('drawImage', [
					a.image, draw.from.x, draw.from.y, draw.getWidth(), draw.getHeight()
				]);
			}
		} else {
			throw new TypeError('Wrong Args in Context.drawImage');
		}
		return this.restore();
	},
	projectiveImage : function (arg) {
		// test
		new LibCanvas.Inner.ProjectiveTexture(arg.image)
			.setContext(this.ctx2d)
			.setQuality(arg.patchSize, arg.limit)
			.render(new Shapes.Polygon(Array.collect(arg, [0, 1, 3, 2])));
		return this;
	},
	putImageData : function () {
		var a = arguments;
		var put = {};
		if (a.length == 1 && typeof a == 'object') {
			a = a[0];
			put.image = a.image;
			put.from  = Point.from(a.from);
		} else if (a.length >= 2) {
			put.image = a[0];
			put.from = Point.from(a.length > 2 ? [a[1], a[2]] : a[1]);
		}
		return this.original('putImageData', [
			put.image, put.from.x, put.from.y
		]);
	},
	getImageData : function (rectangle) {
		var rect = office.makeRect.call(this, arguments);
		return this.ctx2d.getImageData(rect.from.x, rect.from.y, rect.getWidth(), rect.getHeight());
	},
	getPixels : function (rectangle) {
		var rect = office.makeRect.call(this, arguments);
		var data = this.getImageData(rect).data;

		var result = [], line = [];
		for (var i = 0, L = data.length; i < L; i+=4)  {
			line.push({
				r : data[i],
				g : data[i+1],
				b : data[i+2],
				a : data[i+3] / 255
			});
			if (line.length == rect.width) {
				result.push(line);
				line = [];
			}
		}
		return result;
	},
	// this function is only dublicated as original. maybe, i will change them,
	createLinearGradient : function () {
		return this.ctx2d.createLinearGradient.apply(this.ctx2d, arguments);
	},
	createRadialGradient : function () {
		return this.ctx2d.createRadialGradient.apply(this.ctx2d, arguments);
	},
	createPattern : function () {
		return this.ctx2d.createPattern.apply(this.ctx2d, arguments);
	},
	drawWindow : function () {
		return this.original('drawWindow', arguments);
	}
	// Such moz* methods wasn't duplicated:
	// mozTextStyle, mozDrawText, mozMeasureText, mozPathText, mozTextAlongPath

	// is this just properties , that can be used by set ?
	// shadowOffsetX shadowOffsetY shadowBlur shadowColor
});

LibCanvas.Context2D.office = office;

LibCanvas.addCanvasContext('2d-libcanvas', LibCanvas.Context2D);

})();

/*
---

name: "Keyboard"

description: "A keyboard control abstraction class"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Keyboard

...
*/

(function () {

var Keyboard = LibCanvas.Keyboard = atom.Class({
	Static: {
		keyCodes : {
			// Alphabet
			a:65, b:66, c:67, d:68, e:69,
			f:70, g:71, h:72, i:73, j:74,
			k:75, l:76, m:77, n:78, o:79,
			p:80, q:81, r:82, s:83, t:84,
			u:85, v:86, w:87, x:88, y:89, z:90,
			// Numbers
			n0:48, n1:49, n2:50, n3:51, n4:52,
			n5:53, n6:54, n7:55, n8:56, n9:57,
			// Controls
			tab:  9, enter:13, shift:16, backspace:8,
			ctrl:17, alt  :18, esc  :27, space    :32,
			menu:93, pause:19, cmd  :91,
			insert  :45, home:36, pageup  :33,
			'delete':46, end :35, pagedown:34,
			// F*
			f1:112, f2:113, f3:114, f4 :115, f5 :116, f6 :117,
			f7:118, f8:119, f9:120, f10:121, f11:122, f12:123,
			// numpad
			np0: 96, np1: 97, np2: 98, np3: 99, np4:100,
			np5:101, np6:102, np7:103, np8:104, np9:105,
			npslash:11,npstar:106,nphyphen:109,npplus:107,npdot:110,
			// Lock
			capslock:20, numlock:144, scrolllock:145,

			// Symbols
			equals: 61, hyphen   :109, coma  :188, dot:190,
			gravis:192, backslash:220, sbopen:219, sbclose:221,
			slash :191, semicolon: 59, apostrophe : 222,

			// Arrows
			aleft:37, aup:38, aright:39, adown:40
		},
		keyStates: {},
		keyState: function (keyName) {
			return this.keyStates[this.keyName(keyName)];
		},
		keyName: function (code) {
			return (typeof code == 'string') ? code : this.key(code);
		},
		key: function (code) {
			if ('keyCode' in code) return this.codeNames[code.keyCode];
			return this[typeof code == 'number' ? 'codeNames' : 'keyCodes'][code] || null;
		}
	},
	initialize : function (libcanvas, preventDefault) {
		this.libcanvas  = libcanvas;
		this.preventDefault = preventDefault; 
		this.bindings = {};
	},
	setEvents: function () {
		var win = atom(window).bind({
			keydown: this.keyEvent(true),
			keyup:   this.keyEvent(false)
		});

		this.preventDefault && win.bind({
			keypress : function (e) {
				return !this.prevent(this.self.key(e));
			}.context(this)
		});
	},
	getBinding: function (keyName, createIfNull) {
		var bindings = this.bindinds;
		if (!keyName in bindings && createIfNull) {
			bindings[keyName] = [];
		}
		return bindings[keyName] || null;
	},
	keyEvent: function (setTo) {
		return function (e) {
			var b, key = this.self.key(e);
			this.self.keyStates[key] = setTo;
			if (setTo && (b = this.getBinding(key))) b.invoke(this.libcanvas, e, key);
			return !this.prevent(key);
		}.context(this);
	},
	prevent : function (key) {
		var pD = this.preventDefault;
		return pD && (!Array.isArray(pD) || pD.contains(key));
	},
	keyState : function (keyName) {
		return this.self.keyState(keyName);
	},
	bind : function (keyName, fn) {
		if (arguments.length == 1) {
			for (var i in keyName) this.bind(i, keyName[i]);
			return this;
		}
		this.getBinding(keyName, true).push(fn);
		return this;
	},
	unbind : function (key, fn) {
		this.bindings[key].erase(fn);
		return this;
	}
});

Keyboard.extend({ codeNames: Object.invert(Keyboard.keyCodes) });

})();


/*
---

name: "Engines.Tile"

description: "Helper for building tile maps (e.g. for Tetris or ur's favorite Dune II - http://en.wikipedia.org/wiki/Tile_engine)"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Context2D
	- Shapes.Rectangle
	- Behaviors.Bindable

provides: Engines.Tile

...
*/

LibCanvas.namespace('Engines').Tile = atom.Class({
	Implements: [LibCanvas.Behaviors.Bindable],
	tiles : {},
	rects : {},
	first : true,

	cellWidth  : 0,
	cellHeight : 0,
	margin : 0,
	initialize : function (canvas) {
		this.elem = canvas;
		this.ctx  = canvas.getContext('2d-libcanvas');
	},
	checkMatrix : function (matrix) {
		if (!matrix.length) throw new TypeError('Matrix should have at least one row');
		var width = matrix[0].length;
		if (!width) throw new TypeError('Matrix should have at least one cell');
		for (var i = matrix.length; i--;) if (matrix[i].length != width) {
			throw new TypeError('Line ' + i + ' width is ' + matrix[i].length + '. Should be ' + width);
		}
		return true;
	},
	createMatrix : function (width, height, fill) {
		var matrix = new Array(height);
		for (var y = height; y--;) matrix[y] = Array.fill(width, fill);
		this.setMatrix(matrix);
		return matrix;
	},
	setMatrix : function (matrix) {
		this.first = true;
		this.checkMatrix(matrix);
		this.matrix    = matrix;
		this.oldMatrix = matrix.clone();
		return this;
	},
	// todo: check if clone is successfull
	//cloneMatrix : function (matrix) {
	//	return matrix.clone();
	//},
	addTile : function (index, fn) {
		this.tiles[index] = fn;
		return this;
	},
	addTiles : function (tiles) {
		for (var i in tiles) this.addTile(i, tiles[i]);
		return this;
	},
	setSize : function (cellWidth, cellHeight, margin) {
		this.cellWidth  = cellWidth;
		this.cellHeight = cellHeight;
		this.margin = margin;
		return this;
	},
	update : function () {
		var changed = false, old = this.oldMatrix;
		this.each(function (cell) {
			if (this.first || old[cell.y][cell.x] != cell.t) {
				changed = true;
				this.drawCell(cell);
				old[cell.y][cell.x] = cell.t;
			}
		}.context(this));
		this.first = false;
		if (changed) this.bind('update');
		return this;
	},
	getRect : function (cell) {
		if (!this.rects['0.0']) this.each(function (cell) {
			var index = cell.x + '.' + cell.y;
			this.rects[index] = new LibCanvas.Shapes.Rectangle({
				from : [
					(this.cellWidth  + this.margin) * cell.x,
					(this.cellHeight + this.margin) * cell.y
				],
				size : [this.cellWidth, this.cellHeight]
			});
		});
		return this.rects[cell.x + '.' + cell.y];
	},
	getCell : function (point) {
		point = Point.from(arguments);
		var x = parseInt(point.x / (this.cellWidth  + this.margin)),
			y = parseInt(point.y / (this.cellHeight + this.margin)),
			row = this.matrix[y];
		return (row && x in row) ? {
			t : row[x],
			x : x,
			y : y
		} : null;
	},
	drawCell : function (cell /*{t,x,y}*/) {
		var rect = this.getRect(cell), fn = this.tiles[cell.t];
		if (!fn && fn !== 0 && 'default' in this.tiles) fn = this.tiles['default'];
		this.ctx.clearRect(rect);
		if (atom.isDomElement(fn)) {
			this.ctx.drawImage({
				image : fn,
				draw  : rect
			});
		} else if (typeof fn == 'function') {
			fn(this.ctx, rect, cell);
		} else if (fn !== null) {
			this.ctx.fill(rect, fn);
		}
		return this;
	},
	each : function (fn) {
		var m = this.matrix, height = this.height(), width = this.width(), x, y;
		for (y = 0; y < height; y++) for (x = 0; x < width; x++) {
			fn.call(this, {
				t : m[y][x],
				x : x,
				y : y
			});
		}
		return this;
	},
	width : function () {
		return (this.matrix[0] && this.matrix[0].length) || 0;
	},
	height : function () {
		return this.matrix.length || 0;
	}
});

/*
---

name: "Inner.ProjectiveTexture"

description: "Provides testing projective textures rendering (more info: http://acko.net/files/projective/index.html)"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Inner.ProjectiveTexture

...
*/

(function () {

LibCanvas.namespace('Inner').ProjectiveTexture = atom.Class({
	initialize : function (image) {
		if (typeof image == 'string') {
			this.image = new Image;
			image.src = image
		} else {
			this.image = image;
		}
		this.patchSize = 64;
		this.limit = 4;
	},
	setQuality : function (patchSize, limit) {
		this.patchSize = patchSize == null ? 64 : patchSize;
		this.limit = limit == null ? 4 : limit;
		return this;
	},
	setContext : function (ctx) {
		this.ctx = ctx;
		return this;
	},
	render : function (points) {
		var tr = getProjectiveTransform(points);

		// Begin subdivision process.
		var ptl = tr.transformProjectiveVector([0, 0, 1]);
		var ptr = tr.transformProjectiveVector([1, 0, 1]);
		var pbl = tr.transformProjectiveVector([0, 1, 1]);
		var pbr = tr.transformProjectiveVector([1, 1, 1]);

		this.transform = tr;

		divide.call(this, 0, 0, 1, 1, ptl, ptr, pbl, pbr, this.limit);
		
		return this;
	}
});

var divide = function (u1, v1, u4, v4, p1, p2, p3, p4, limit) {

	 // See if we can still divide.
	if (limit) {
		// Measure patch non-affinity.
		var d1 = [p2[0] + p3[0] - 2 * p1[0], p2[1] + p3[1] - 2 * p1[1]];
		var d2 = [p2[0] + p3[0] - 2 * p4[0], p2[1] + p3[1] - 2 * p4[1]];
		var d3 = [d1[0] + d2[0], d1[1] + d2[1]];
		var r = Math.abs((d3[0] * d3[0] + d3[1] * d3[1]) / (d1[0] * d2[0] + d1[1] * d2[1]));

		// Measure patch area.
		d1 = [p2[0] - p1[0] + p4[0] - p3[0], p2[1] - p1[1] + p4[1] - p3[1]];
		d2 = [p3[0] - p1[0] + p4[0] - p2[0], p3[1] - p1[1] + p4[1] - p2[1]];
		var area = Math.abs(d1[0] * d2[1] - d1[1] * d2[0]);

		// Check area > patchSize pixels (note factor 4 due to not averaging d1 and d2)
		// The non-affinity measure is used as a correction factor.
		if ((u1 == 0 && u4 == 1) || ((.25 + r * 5) * area > (this.patchSize * this.patchSize))) {
			// Calculate subdivision points (middle, top, bottom, left, right).
			var umid = (u1 + u4) / 2;
			var vmid = (v1 + v4) / 2;
			var tr   = this.transform;
			var pmid = tr.transformProjectiveVector([umid, vmid, 1]);
			var pt   = tr.transformProjectiveVector([umid, v1, 1]);
			var pb   = tr.transformProjectiveVector([umid, v4, 1]);
			var pl   = tr.transformProjectiveVector([u1, vmid, 1]);
			var pr   = tr.transformProjectiveVector([u4, vmid, 1]);
			
			// Subdivide.
			limit--;
			divide.call(this,   u1,   v1, umid, vmid,   p1,   pt,   pl, pmid, limit);
			divide.call(this, umid,   v1,   u4, vmid,   pt,   p2, pmid,   pr, limit);
			divide.call(this,  u1,  vmid, umid,   v4,   pl, pmid,   p3,   pb, limit);
			divide.call(this, umid, vmid,   u4,   v4, pmid,   pr,   pb,   p4, limit);

			return;
		}
	}
	
	var ctx = this.ctx;

	// Render this patch.
	ctx.save();
	// Set clipping path.
	ctx.beginPath();
	ctx.moveTo(p1[0], p1[1]);
	ctx.lineTo(p2[0], p2[1]);
	ctx.lineTo(p4[0], p4[1]);
	ctx.lineTo(p3[0], p3[1]);
	ctx.closePath();
	//ctx.clip();

	// Get patch edge vectors.
	var d12 = [p2[0] - p1[0], p2[1] - p1[1]];
	var d24 = [p4[0] - p2[0], p4[1] - p2[1]];
	var d43 = [p3[0] - p4[0], p3[1] - p4[1]];
	var d31 = [p1[0] - p3[0], p1[1] - p3[1]];

	// Find the corner that encloses the most area
	var a1 = Math.abs(d12[0] * d31[1] - d12[1] * d31[0]);
	var a2 = Math.abs(d24[0] * d12[1] - d24[1] * d12[0]);
	var a4 = Math.abs(d43[0] * d24[1] - d43[1] * d24[0]);
	var a3 = Math.abs(d31[0] * d43[1] - d31[1] * d43[0]);
	var amax = Math.max(Math.max(a1, a2), Math.max(a3, a4));
	var dx = 0, dy = 0, padx = 0, pady = 0;

	// Align the transform along this corner.
	switch (amax) {
		case a1:
			ctx.transform(d12[0], d12[1], -d31[0], -d31[1], p1[0], p1[1]);
			// Calculate 1.05 pixel padding on vector basis.
			if (u4 != 1) padx = 1.05 / Math.sqrt(d12[0] * d12[0] + d12[1] * d12[1]);
			if (v4 != 1) pady = 1.05 / Math.sqrt(d31[0] * d31[0] + d31[1] * d31[1]);
			break;
		case a2:
			ctx.transform(d12[0], d12[1],  d24[0],  d24[1], p2[0], p2[1]);
			// Calculate 1.05 pixel padding on vector basis.
			if (u4 != 1) padx = 1.05 / Math.sqrt(d12[0] * d12[0] + d12[1] * d12[1]);
			if (v4 != 1) pady = 1.05 / Math.sqrt(d24[0] * d24[0] + d24[1] * d24[1]);
			dx = -1;
			break;
		case a4:
			ctx.transform(-d43[0], -d43[1], d24[0], d24[1], p4[0], p4[1]);
			// Calculate 1.05 pixel padding on vector basis.
			if (u4 != 1) padx = 1.05 / Math.sqrt(d43[0] * d43[0] + d43[1] * d43[1]);
			if (v4 != 1) pady = 1.05 / Math.sqrt(d24[0] * d24[0] + d24[1] * d24[1]);
			dx = -1;
			dy = -1;
			break;
		case a3:
			// Calculate 1.05 pixel padding on vector basis.
			ctx.transform(-d43[0], -d43[1], -d31[0], -d31[1], p3[0], p3[1]);
			if (u4 != 1) padx = 1.05 / Math.sqrt(d43[0] * d43[0] + d43[1] * d43[1]);
			if (v4 != 1) pady = 1.05 / Math.sqrt(d31[0] * d31[0] + d31[1] * d31[1]);
			dy = -1;
			break;
	}

	// Calculate image padding to match.
	var du = (u4 - u1);
	var dv = (v4 - v1);
	var padu = padx * du;
	var padv = pady * dv;


	var iw = this.image.width;
	var ih = this.image.height;

	ctx.drawImage(
		this.image,
		u1 * iw,
		v1 * ih,
		Math.min(u4 - u1 + padu, 1) * iw,
		Math.min(v4 - v1 + padv, 1) * ih,
		dx, dy,
		1 + padx, 1 + pady
	);
	ctx.restore();
}

/**
 * Generic matrix class. Built for readability, not for speed.
 *
 * (c) Steven Wittens 2008
 * http://www.acko.net/
 */
var Matrix = function (w, h, values) {
  this.w = w;
  this.h = h;
  this.values = values || allocate(h);
};

var allocate = function (w, h) {
  var values = [];
  for (var i = 0; i < h; ++i) {
    values[i] = [];
    for (var j = 0; j < w; ++j) {
      values[i][j] = 0;
    }
  }
  return values;
}

var cloneValues = function (values) {
	var clone = [];
	for (var i = 0; i < values.length; ++i) {
		clone[i] = [].concat(values[i]);
	}
	return clone;
}

function getProjectiveTransform(points) {
  var eqMatrix = new Matrix(9, 8, [
    [ 1, 1, 1,   0, 0, 0, -points[3][0],-points[3][0],-points[3][0] ],
    [ 0, 1, 1,   0, 0, 0,  0,-points[2][0],-points[2][0] ],
    [ 1, 0, 1,   0, 0, 0, -points[1][0], 0,-points[1][0] ],
    [ 0, 0, 1,   0, 0, 0,  0, 0,-points[0][0] ],

    [ 0, 0, 0,  -1,-1,-1,  points[3][1], points[3][1], points[3][1] ],
    [ 0, 0, 0,   0,-1,-1,  0, points[2][1], points[2][1] ],
    [ 0, 0, 0,  -1, 0,-1,  points[1][1], 0, points[1][1] ],
    [ 0, 0, 0,   0, 0,-1,  0, 0, points[0][1] ]

  ]);

  var kernel = eqMatrix.rowEchelon().values;
  var transform = new Matrix(3, 3, [
    [-kernel[0][8], -kernel[1][8], -kernel[2][8]],
    [-kernel[3][8], -kernel[4][8], -kernel[5][8]],
    [-kernel[6][8], -kernel[7][8],             1]
  ]);
  return transform;
}

Matrix.prototype = {
	add : function (operand) {
		if (operand.w != this.w || operand.h != this.h) {
			throw new Error("Matrix add size mismatch");
		}

		var values = allocate(this.w, this.h);
		for (var y = 0; y < this.h; ++y) {
			for (var x = 0; x < this.w; ++x) {
			  values[y][x] = this.values[y][x] + operand.values[y][x];
			}
		}
		return new Matrix(this.w, this.h, values);
	},
	transformProjectiveVector : function (operand) {
		var out = [], x, y;
		for (y = 0; y < this.h; ++y) {
			out[y] = 0;
			for (x = 0; x < this.w; ++x) {
				out[y] += this.values[y][x] * operand[x];
			}
		}
		var iz = 1 / (out[out.length - 1]);
		for (y = 0; y < this.h; ++y) {
			out[y] *= iz;
		}
		return out;
	},
	multiply : function (operand) {
		var values, x, y;
		if (+operand !== operand) {
			// Matrix mult
			if (operand.h != this.w) {
				throw new Error("Matrix mult size mismatch");
			}
			values = allocate(this.w, this.h);
			for (y = 0; y < this.h; ++y) {
				for (x = 0; x < operand.w; ++x) {
					var accum = 0;
					for (var s = 0; s < this.w; s++) {
						accum += this.values[y][s] * operand.values[s][x];
					}
					values[y][x] = accum;
				}
			}
			return new Matrix(operand.w, this.h, values);
		}
		else {
			// Scalar mult
			values = allocate(this.w, this.h);
			for (y = 0; y < this.h; ++y) {
				for (x = 0; x < this.w; ++x) {
					values[y][x] = this.values[y][x] * operand;
				}
			}
			return new Matrix(this.w, this.h, values);
		}
	},
	rowEchelon : function () {
		if (this.w <= this.h) {
			throw new Error("Matrix rowEchelon size mismatch");
		}

		var temp = cloneValues(this.values);

		// Do Gauss-Jordan algorithm.
		for (var yp = 0; yp < this.h; ++yp) {
			// Look up pivot value.
			var pivot = temp[yp][yp];
			while (pivot == 0) {
				// If pivot is zero, find non-zero pivot below.
				for (var ys = yp + 1; ys < this.h; ++ys) {
					if (temp[ys][yp] != 0) {
						// Swap rows.
						var tmpRow = temp[ys];
						temp[ys] = temp[yp];
						temp[yp] = tmpRow;
						break;
					}
				}
				if (ys == this.h) {
					// No suitable pivot found. Abort.
					return new Matrix(this.w, this.h, temp);
				}
				else {
					pivot = temp[yp][yp];
				}
			}
			// Normalize this row.
			var scale = 1 / pivot;
			for (var x = yp; x < this.w; ++x) {
				temp[yp][x] *= scale;
			}
			// Subtract this row from all other rows (scaled).
			for (var y = 0; y < this.h; ++y) {
				if (y == yp) continue;
				var factor = temp[y][yp];
				temp[y][yp] = 0;
				for (x = yp + 1; x < this.w; ++x) {
					temp[y][x] -= factor * temp[yp][x];
				}
			}
		}

		return new Matrix(this.w, this.h, temp);
	},
	invert : function () {
		var x, y;

		if (this.w != this.h) {
			throw new Error("Matrix invert size mismatch");
		}

		var temp = allocate(this.w * 2, this.h);

		// Initialize augmented matrix
		for (y = 0; y < this.h; ++y) {
			for (x = 0; x < this.w; ++x) {
				temp[y][x] = this.values[y][x];
				temp[y][x + this.w] = (x == y) ? 1 : 0;
			}
		}

		temp = new Matrix(this.w * 2, this.h, temp);
		temp = temp.rowEchelon();

		// Extract right block matrix.
		var values = allocate(this.w, this.h);
		for (y = 0; y < this.w; ++y) {
			// @todo check if "x < this.w;" is mistake
			for (x = 0; x < this.w; ++x) {
				values[y][x] = temp.values[y][x + this.w];
			}
		}
		return new Matrix(this.w, this.h, values);
	}
};

})();

/*
---

name: "Processors.Clearer"

description: "Сleans canvas with specified color"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
	- LibCanvas
	- Context2D

provides: Processors.Clearer

...
*/

LibCanvas.namespace('Processors').Clearer = atom.Class({
	style : null,
	initialize : function (style) {
		this.style = style || null;
	},
	process : function (libcanvas) {
		this.style ?
			libcanvas.ctx.fillAll(this.style) :
			libcanvas.ctx.clearAll();
	}
	// processCanvas : function (elem) {}
	// processPixels : function (elem) {}
});

/*
---

name: "Processors.Color"

description: "Abstract class for works with color"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
	- LibCanvas

provides: Processors.Color

...
*/

new function () {

var math = Math, round = math.round;

LibCanvas.namespace('Processors').Color = atom.Class({
	rgbToHsb: function(red, green, blue){
		var hue = 0,
			max = math.max(red, green, blue),
			delta = max - math.min(red, green, blue),
			brightness = max / 255,
			saturation = (max != 0) ? delta / max : 0;
		if (saturation) {
			var rr = (max - red)   / delta,
			    gr = (max - green) / delta,
			    br = (max - blue)  / delta;
			     if (red   == max) hue = br - gr;
			else if (green == max) hue = 2 + rr - br;
			else                   hue = 4 + gr - rr;
			hue /= 6;
			
			if (hue < 0) hue++;
		}
		return [round(hue * 360), round(saturation * 100), round(brightness * 100)];
	},

	hsbToRgb: function(hue, sat, bri){
		bri = round(bri / 100 * 255);
		if (!sat) return [bri, bri, bri];

		var hue = hue % 360,
			f = hue % 60,
			p = round((bri * (100  - sat)) / 10000 * 255),
			q = round((bri * (6000 - sat * f)) / 600000 * 255),
			t = round((bri * (6000 - sat * (60 - f))) / 600000 * 255);
		switch (parseInt(hue / 60)){
			case 0: return [bri, t, p];
			case 1: return [q, bri, p];
			case 2: return [p, bri, t];
			case 3: return [p, q, bri];
			case 4: return [t, p, bri];
			case 5: return [bri, p, q];
		}
		return null;
	}
});

}();

/*
---

name: "Processors.Grayscale"

description: "Grayscale canvas"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
	- LibCanvas

provides: Processors.Grayscale

...
*/

LibCanvas.namespace('Processors').Grayscale = atom.Class({
	style : null,
	initialize : function (type) {
		// luminance, average, red, green, blue, default
		this.type = type || 'default';
	},
	processPixels : function (data) {
		var i, l, r, g, b,
			d = data.data,
			type = this.type,
			set = function (i, value) {
				d[i] = d[i+1] = d[i+2] = value;
			};

		for (i = 0, l = d.length; i < l; i+=4) {
			r = d[i];
			g = d[i+1];
			b = d[i+2];
			switch (type) {
				case 'luminance': set(i, 0.2126*r + 0.7152*g + 0.0722*b); break;
				case 'average'  : set(i, (r + g + b)/3); break;
				case 'red'      : set(i, r); break;
				case 'green'    : set(i, g); break;
				case 'blue'     : set(i, b); break;
				default : set(i, (3*r + 6*g + b) / 10.); break;
			}
		}
		return data;
	}
});

/*
---

name: "Processors.HsbShift"

description: "Shift on of hue|saturation|bright value of all colors"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
	- LibCanvas
	- Processors.Color

provides: Processors.HsbShift

...
*/


LibCanvas.namespace('Processors').HsbShift = atom.Class({
	Extends: LibCanvas.Processors.Color,
	shift : 0,
	param : 'hue',
	initialize : function (shift, param) {
		// hue, sat, bri
		this.param =    param || this.param;
		this.shift = 1*(shift || this.shift);
		if (this.param == 'hue') {
			this.shift %= 360;
			if (this.shift < 0) this.shift += 360;
		} else {
			this.shift = this.shift.limit(-100, 100);
		}
	},
	processPixels : function (data) {
		var d = data.data,
			shift = this.shift,
			param = this.param,
			key   = { hue: 0, sat: 1, bri: 2 }[param],
			i, hsb, rgb;
		for (i = 0; i < d.length; i+=4) {
			if ((param == 'hue' || param == 'sat') && d[i] == d[i+1] && d[i] == d[i+2]) continue;

			hsb = this.rgbToHsb(d[i], d[i+1], d[i+2]);
			param == 'hue' ?
				(hsb[0  ] = (hsb[0]   + shift) % 360) :
				(hsb[key] = (hsb[key] + shift).limit(0, 100));
			rgb = this.hsbToRgb(hsb[0], hsb[1], hsb[2]);

			d[i  ] = rgb[0];
			d[i+1] = rgb[1];
			d[i+2] = rgb[2];
		}
		return data;
	}
});

/*
---

name: "Processors.Invert"

description: "Invert all canvas colors"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
	- LibCanvas

provides: Processors.Invert

...
*/

LibCanvas.namespace('Processors').Invert = atom.Class({
	processPixels : function (data) {
		var d = data.data, i = 0, l = d.length;
		for (;i < l; i++) if (i % 4 != 3) d[i] = 255 - d[i];
		return data;
	}
});

/*
---

name: "Processors.Mask"

description: "Use canvas as mask for color (black will be transparent, white will be color)"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
	- LibCanvas

provides: Processors.Mask

...
*/

LibCanvas.namespace('Processors').Mask = atom.Class({
	color : null,
	initialize : function (color) { // [r,g,b]
		this.color = color || [0,0,0];
	},
	processPixels : function (data) {
		var c = this.color, d = data.data, i = 0, l = d.length;
		for (;i < l; i+=4) {
			d[i+3] = d[i];
			d[i]   = c[0];
			d[i+1] = c[1];
			d[i+2] = c[2];
		}
		return data;
	}
});

/*
---

name: "Shapes.Ellipse"

description: "Provides ellipse as canvas object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shapes.Rectangle

provides: Shapes.Ellipse

...
*/

LibCanvas.namespace('Shapes').Ellipse = atom.Class({
	Extends: LibCanvas.Shapes.Rectangle,
	set : function () {
		this.parent.apply(this, arguments);
		var update = function () {
			this.updateCache = true;
		}.context(this);
		this.from.bind('move', update);
		this. to .bind('move', update);
	},
	rotateAngle : 0,
	rotate : function (degree) {
		this.rotateAngle = (this.rotateAngle + degree)
			.normalizeAngle();
		this.updateCache = true;
		return this;
	},
	getBufferCtx : function () {
		return this.bufferCtx || (this.bufferCtx = LibCanvas.Buffer(1, 1, true).ctx);
	},
	hasPoint : function () {
		var ctx = this.processPath(this.getBufferCtx()); 
		return ctx.isPointInPath(LibCanvas.Point.from(arguments));
	},
	cache : null,
	updateCache : true,
	countCache : function () {
		if (this.cache && !this.updateCache) {
			return this.cache;
		}

		var Point = LibCanvas.Point;
		if (this.cache === null) {
			this.cache = [];
			for (var i = 12; i--;) this.cache.push(new Point());
		}
		var c = this.cache,
			angle = this.rotateAngle,
			kappa = .5522848,
			x  = this.from.x,
			y  = this.from.y,
			xe = this.to.x,
			ye = this.to.y,
			xm = (xe + x) / 2,
			ym = (ye + y) / 2,
			ox = (xe - x) / 2 * kappa,
			oy = (ye - y) / 2 * kappa;
		c[0].set(x, ym - oy); c[ 1].set(xm - ox, y); c[ 2].set(xm, y);
		c[3].set(xm + ox, y); c[ 4].set(xe, ym -oy); c[ 5].set(xe, ym);
		c[6].set(xe, ym +oy); c[ 7].set(xm +ox, ye); c[ 8].set(xm, ye);
		c[9].set(xm -ox, ye); c[10].set(x, ym + oy); c[11].set(x, ym);

		if (angle) {
			var center = new Point(xm, ym);
			for (i = c.length; i--;) c[i].rotate(angle, center);
		}

		return c;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		var c = this.countCache();
		ctx.beginPath(c[11])
		   .bezierCurveTo(c[0], c[1], c[2])
		   .bezierCurveTo(c[3], c[4], c[5])
		   .bezierCurveTo(c[6], c[7], c[8])
		   .bezierCurveTo(c[9], c[10],c[11]);
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	}
});

/*
---

name: "Shapes.Line"

description: "Provides line as canvas object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Line

...
*/

new function () {

var LibCanvas = window.LibCanvas, Point = LibCanvas.Point, Shapes = LibCanvas.Shapes;

var Path = LibCanvas.namespace('Shapes').Path = atom.Class({
	Extends: LibCanvas.Shape,
	// todo : refactoring
	set : function (builder) {
		this.builder = builder;
		builder.path = this;
		return this;
	},
	getBuffer : function () {
		if (!this.buffer) this.buffer = LibCanvas.Buffer(1, 1, true);
		return this.buffer;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		this.builder.parts.forEach(function (part) {
			ctx[part.method].apply(ctx, part.args);
		});
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	hasPoint : function (point) {
		var ctx = this.getBuffer().ctx;
		if (this.builder.changed) {
			this.builder.changed = false;
			this.processPath(ctx);
		}
		return ctx.isPointInPath(Point.from(arguments));
	},
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	},
	move : function (distance) {
		var moved = [];
		var move = function (a) {
			if (!moved.contains(a)) {
				a.move(distance);
				moved.push(a);
			}
		};
		this.builder.parts.forEach(function (part) {
			var a = part.args[0];
			switch(part.method) {
				case 'moveTo':
				case 'lineTo':
					move(a);
					break;
				case 'bezierCurveTo':
					for (var prop in ['p1', 'p2', 'to'].toKeys()) move(prop);
					break;
				case 'arc':
					move(a.circle);
					break;
			}
		});
		return this;
	}
});

LibCanvas.namespace('Shapes.Path').Builder = atom.Class({
	Extends: LibCanvas.Shape,
	parts : [],
	changed : true,
	add : function (method, args) {
		this.changed = true;
		this.parts.push({
			method : method,
			args : args
		});
		return this;
	},
	pop : function () {
		this.changed = true;
		this.parts.pop();
		return this;
	},
	move : function () {
		return this.add('moveTo', [Point.from(arguments)]);
	},
	line : function () {
		return this.add('lineTo', [Point.from(arguments)]);
	},
	curve : function (p1, p2, to) {
		var args = Array.pickFrom(arguments);
		
		if (args.length >= 6) {
			return this.curve(
				[ args[0], args[1] ],
				[ args[2], args[3] ],
				[ args[4], args[5] ]
			);
		}
		if (args[0] != null) {
			args = {
				p1 : args[0],
				p2 : args[1],
				to : args[2]
			};
		}
		for (var i in args) args[i] = Point.from(args[i]);
		return this.add('bezierCurveTo', [args]);
	},
	arc : function (circle, angle, acw) {
		var a = Array.pickFrom(arguments);

		if (a.length >= 6) {
			return this.arc({
				circle : [ a[0], a[1], a[2] ],
				angle : [ a[3], a[4] ],
				acw : a[5]
			});
		}
		a.circle = Shapes.Circle.from(a.circle);
		if (Array.isArray(a.angle)) {
			a.angle = {
				start : a.angle[0],
				end   : a.angle[1]
			};
		}
		a.acw = !!a.acw;
		return this.add('arc', [a]);
	},
	hasPoint : function () {
		var path = this.build();
		return path.hasPoint.apply(path, arguments);
	},
	string : function () {
		var string = '';
		this.parts.forEach(function (part) {
			var a = part.args[0];
			switch(part.method) {
				case 'moveTo':
					string += 'move,' + a.x.round(2) + ',' + a.y.round(2);
					break;
				case 'lineTo':
					string += 'line,' + a.x.round(2) + ',' + a.y.round(2);
					break;
				case 'bezierCurveTo':
					string += 'curve,';
					for (var prop in ['p1', 'p2', 'to'].toKeys()) {
						string += a[prop].x.round(2) + ',' + a[prop].y.round(2);
						if (prop != 'to') string += ',';
					}
					break;
				case 'arc':
					string += 'arc,';
					string += a.circle.center.x.round(2) + ',' + a.circle.center.y.round(2) + ',';
					string += a.circle.radius.round(2) + ',' + a.angle.start.round(2) + ',';
					string += a.angle.end.round(2) + ',' + (a.acw ? 1 : 0);
					break;
			}
			string += '/';
		}.context(this));
		return string;
	},
	parseString : function (string) {
		string.split('/').forEach(function (line) {
			if (line) {
				var parts  = line.split(',');
				var method = parts.shift();
				for (var i = parts.length; i--;) parts[i] *= 1;
				this[method].apply(this, parts);
			}
		}.context(this));
	},
	build : function () {
		if (arguments.length == 1) this.parseString(arguments[0]);
		if (!this.path) this.path = new Path(this);
		return this.path;
	}
});

}();

/*
---

name: "Shapes.Polygon"

description: "Provides user-defined concave polygon as canvas object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Polygon

...
*/
(function (){


var linesIntersect = function (a,b,c,d) {
	var x,y;
	if (d.x == c.x) { // DC == vertical line
		if (b.x == a.x) {
			return a.x == d.x && (a.y.between(c.y, d.y) || b.x.between(c.y, d.y));
		}
		x = d.x;
		y = b.y + (x-b.x)*(a.y-b.y)/(a.x-b.x);
	} else {
		x = ((a.x*b.y - b.x*a.y)*(d.x-c.x)-(c.x*d.y - d.x*c.y)*(b.x-a.x))/((a.y-b.y)*(d.x-c.x)-(c.y-d.y)*(b.x-a.x));
		y = ((c.y-d.y)*x-(c.x*d.y-d.x*c.y))/(d.x-c.x);
		x *= -1;
	}
	return (x.between(a.x, b.x, 'LR') || x.between(b.x, a.x, 'LR'))
		&& (y.between(a.y, b.y, 'LR') || y.between(b.y, a.y, 'LR'))
		&& (x.between(c.x, d.x, 'LR') || x.between(d.x, c.x, 'LR'))
		&& (y.between(c.y, d.y, 'LR') || y.between(d.y, c.y, 'LR'));
};

var Point = LibCanvas.Point;

LibCanvas.namespace('Shapes').Polygon = atom.Class({
	Extends: LibCanvas.Shape,
	points: [],
	set : function () {
		this.points.empty()
			.append(
				Array.pickFrom(arguments)
					.map(function (elem) {
						if (elem) return Point.from(elem);
					})
					.clean()
			);
		return this;
	},
	get length () {
		return this.points.length;
	},
	get: function (index) {
		return this.points[index];
	},
	hasPoint : function (point) {
		point = Point.from(Array.pickFrom(arguments));

		var result = false, points = this.points;
		for (var i = 0, l = this.length; i < l; i++) {
			var k = (i || l) - 1, I = points[i], K = points[k];
			if (
				(point.y.between(I.y , K.y, "L") || point.y.between(K.y , I.y, "L"))
					&&
				 point.x < (K.x - I.x) * (point.y -I.y) / (K.y - I.y) + I.x
			) {
				result = !result;
			}
		}
		return result;
	},
	getCoords : function () {
		return this.points[0];
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		for (var i = 0, l = this.points.length; i < l; i++) {
			var point = this.points[i];
			ctx[i > 0 ? 'lineTo' : 'moveTo'](point.x, point.y);
		}
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	move : function (distance, reverse) {
		this.points.invoke('move', arguments);
		return this.parent.apply(this, arguments);
	},
	rotate : function (angle, pivot) {
		this.points.invoke('rotate', arguments);
		return this;
	},
	scale : function (x, y) {
		this.points.invoke('scale', arguments);
		return this;
	},
	intersect : function (poly) {
		var pp = poly.points, tp = this.points, ppL = pp.length, tpL = tp.length;
		for (var i = 0; i < ppL; i++) for (var k = 0; k < tpL; k++) {
			var a = tp[k],
				b = tp[k+1 == tpL ? 0 : k+1],
				c = pp[i],
				d = pp[i+1 == ppL ? 0 : i+1];
			if (linesIntersect(a,b,c,d)) return true;
		}
		return false;
	},
	each : function (fn, context) {
		return this.points.forEach(context ? fn.context(context) : fn);
	},

	getPoints : function () {
		return Array.toHash(this.points);
	}
});

})();

/*
---

name: "Ui.Grip"

description: "Provides base ui object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Bindable
	- Behaviors.Drawable
	- Behaviors.Clickable
	- Behaviors.Draggable
	- Behaviors.Droppable
	- Behaviors.Linkable
	- Behaviors.MouseListener
	- Behaviors.Moveable

provides: Ui.Grip

...
*/


(function () {

var Beh = LibCanvas.Behaviors;

LibCanvas.namespace('Ui').Grip = atom.Class({
	Extends: Beh.Drawable,
	Implements: [
		Beh.Clickable,
		Beh.Draggable,
		Beh.Droppable,
		Beh.Linkable,
		Beh.MouseListener,
		Beh.Moveable
	],

	config : {},
	initialize : function (libcanvas, config) {
		this.libcanvas = libcanvas;
		this.setConfig(config);
		this.setShape(config.shape);
		
		this.getShape().bind('move', libcanvas.update);
		this.bind(['moveDrag', 'statusChanged'], libcanvas.update);
	},
	setConfig : function (config) {
		atom.extend(this.config, config);
		this.libcanvas.update();
		return this;
	},
	getStyle : function (type) {
		var cfg = this.config;
		return (this.active && cfg.active) ? cfg.active[type] :
		       (this.hover  && cfg.hover)  ? cfg.hover [type] :
		                      (cfg[type]  || null);
	},
	drawTo : function (ctx) {
		var fill   = this.getStyle('fill'),
			stroke = this.getStyle('stroke');
		fill   && ctx.fill  (this.getShape(), fill  );
		stroke && ctx.stroke(this.getShape(), stroke);
		return this;
	},
	draw : function () {
		return this.drawTo(this.libcanvas.ctx);
	}
});

})();

/*
---

name: "Utils.AudioContainer"

description: "Provides audio preloader"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Utils.AudioContainer

...
*/

LibCanvas.namespace('Utils').AudioContainer = atom.Class({
	support : false,
	initialize: function (files) {
		this.checkSupport();
		var audio = {};
		for (var i in files) {
			audio[i] = new LibCanvas.Utils.AudioElement(this, files[i]);
		}
		this.audio = audio;
	},
	checkSupport : function () {
		var elem = document.createElement('audio');
		if (elem.canPlayType) {
			var cpt = elem.canPlayType.context(elem);
			this.support = atom.extend(new Boolean(true), {
				// codecs
				ogg : cpt('audio/ogg; codecs="vorbis"'),
				mp3 : cpt('audio/mpeg;'),
				wav : cpt('audio/wav; codecs="1"'),
				m4a : cpt('audio/x-m4a;') || cpt('audio/aac;'),
				// diff
				loop : 'loop' in elem
			});
		}
		return this;
	},
	get : function (index) {
		return this.audio[index];
	},
	allAudios : [],
	mute : function (muted) {
		this.allAudios.forEach(function (audio) {
			audio.muted = muted;
		})
	}
});

/*
---

name: "Utils.AudioElement"

description: "Provides audio container"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Utils.AudioContainer
	- Behaviors.Animatable

provides: Utils.AudioElement

...
*/

LibCanvas.namespace('Utils').AudioElement = atom.Class({
	Implements: [LibCanvas.Behaviors.Animatable],
	stub   : true,
	initialize : function (container, file) {
		if (container.support) {
			this.stub = false;
			this.container = container;
			this.support = container.support;
			this.audio = document.createElement("audio");
			this.src(file);
			container.allAudios.push(this.audio);
		}
	},
	src : function (file) {
		if (this.stub) return this;
		this.audio.src = file.replace(/\*/g, this.getExtension());
		this.audio.load();
		return this;
	},
	getExtension : function () {
		if (this.stub) return null;
		return this.support.ogg ? 'ogg' :
		       this.support.mp3 ? 'mp3' : 'wav';
	},
	cloneAudio : function () {
		if (this.stub) return null;
		if (window.opera) { // opera 10.60 bug. Fixed in 10.61
			var audioClone = document.createElement('audio');
			audioClone.src = this.audio.src;
		} else {
			audioClone = this.audio.cloneNode(true);
		}
		this.events.forEach(function (e) {
			audioClone.addEventListener(e[0], e[1].bind(this), false);
		}.context(this));
		this.container.allAudios.push(audioClone);
		audioClone.load();
		return audioClone;
	},
	play : function () {
		if (this.stub) return this;
		this.getCurrent().play();
		return this;
	},
	pause : function () {
		if (this.stub) return this;
		this.getCurrent().pause();
		return this;
	},
	stop : function (elem) {
		if (this.stub) return this;
		elem = elem || this.getCurrent();
		if (elem.networkState > 2) {
			// firefox 3.5 starting audio bug
			elem.currentTime = 0.025;
		}
		elem.pause();
		return this;
	},
	events : [],
	event : function (event, fn) {
		if (this.stub) return this;
		this.events.push([event, fn]);
		this.audio.addEventListener(event, fn.bind(this), false);
		return this;
	},

	// Gatling
	gatling : function (count) {
		if (this.stub) return this;
		this.barrels = [];
		this.gatIndex =  0;
		while (count--) this.barrels.push(this.cloneAudio());
		return this;
	},
	getNext : function () {
		if (this.stub) return null;
		++this.gatIndex >= this.barrels.length && (this.gatIndex = 0);
		return this.getCurrent();
	},
	getCurrent : function () {
		if (this.stub) return null;
		return this.barrels ? this.barrels[this.gatIndex] : this.audio;
	},
	playNext : function () {
		if (this.stub) return this;
		var elem = this.getNext();
		this.stop(elem);
		elem.play();
		return this;
	},

	// Loop (using gatling in browsers, that doesn't support loop, e.g. in fx)
	loopBinded : false,
	loop : function () {
		if (this.stub) return this;
		if (this.support.loop) {
			this.audio.loop = 'loop';
			this.stop().play();
		} else {
			if (!this.loopBinded) {
				this.event('ended', this.playNext.context(this) ).gatling(2);
				atom(window).bind('unload', this.pause.context(this));
				this.loopBinded = true;
			}
			this.stop().playNext();
		}
		return this;
	},

	// testing. bug if run twice
	fadeOut : function (elem, time) {
		if (this.stub) return this;
		this.animate.call(elem || this.getCurrent(), {
			props  : { volume : 0.05 },
			frames : 20,
			delay  : (time || 1000) / 20,
			onFinish   : function () {
				this.stop();
				this.audio.volume = 0.99;
			}.context(this)
		});
		return this;
	}
});

/*
---

name: "Utils.Image"

description: "Provides some Image extensions"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Shapes.Rectangle

provides: Utils.Image

...
*/

new function () {

var LibCanvas = window.LibCanvas,
	Buffer    = LibCanvas.Buffer,
	Rectangle = LibCanvas.Shapes.Rectangle;

// <image> tag
atom.implement(HTMLImageElement, {
	sprite : function () {
		if (!this.isLoaded()) {
			atom.log('Not loaded in Image.sprite: ', this);
			throw new Error('Not loaded in Image.sprite, logged');
		}
		var buf, bigBuf, rect, index;
		this.spriteCache = this.spriteCache || {};
		if (arguments.length) {
			rect = Rectangle.factory(arguments);
			index = [rect.from.x,rect.from.y,rect.getWidth(),rect.getHeight()].join('.');
			buf = this.spriteCache[index];
			if (!buf) {
				buf    = Buffer(rect.getWidth(), rect.getHeight(), true);
				bigBuf = Buffer(this.width*2   , this.height*2   , true);
				for (var y = 0; y < 2; y++) for (var x = 0; x < 2; x++) {
					bigBuf.ctx.drawImage({
						image : this,
						from : [this.width*x,this.height*y]
					});
				}
				buf.ctx.drawImage({
					image : bigBuf,
					crop  : rect,
					draw  : [0,0,rect.getWidth(),rect.getHeight()]
				});
				bigBuf.ctx.clearAll();
				this.spriteCache[index] = buf;
			}

		} else {
			buf = this.spriteCache[0];
			if (!buf) {
				this.spriteCache[0] = buf = Buffer(this.width, this.height);
				buf.ctx.drawImage(this);
			}
		}
		return buf;
	},
	isLoaded : function () {
		if (!this.complete) return false;
		return this.naturalWidth == null || this.naturalWidth;
	}
});

}();

/*
---

name: "Utils.StopWatch"

description: "StopWatch"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Utils.StopWatch

...
*/


LibCanvas.namespace('Utils').Storage = atom.Class({
	initialize : function () {
		this.store = this.getStorage();
	},
	getStorage : function () {
		return 'localStorage' in window ?
			window.localStorage :
			window.sessionStorage;
	},
	store : '',
	setScope : function (name) {
		var st = this.store;
		name += '\0';
		if (!st[name]) st[name] = {};
		this.scope = st[name];
		return this;
	},
	keys : function () {
		return Object.keys(this.store);
	},
	values : function () {
		var values = [];
		for (var i in this.store) values.push(this.store[i]);
		return values;
	},
	has : function (name) {
		return (name in this.store);
	},
	get : function (name) {
		return this.has(name) ? this.store[name] : null;
	},
	set  : function (name, value) {
		typeof name == 'object' ?
			atom.extend(this.store, name) : (this.store[name] = value);
		return this;
	}
});

/*
---

name: "Utils.TimeLogger"

description: "TimeLogger"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Utils.StopWatch
	- Utils.Trace

provides: Utils.TimeLogger

...
*/
new function () {

var Utils = LibCanvas.Utils;

LibCanvas.namespace('Utils').TimeLogger = atom.Class({
	time : [],
	last : 10,
	sw   : null,
	trace: null,
	initialize : function (last) {
		if (last) this.last = last;
		this.sw    = new Utils.StopWatch();
		this.trace = new Utils.Trace();
	},
	from : function () {
		this.sw.start();
		return this;
	},
	to : function (msg) {
		this.time.push(this.sw.getTime(1));
		this.sw.stop();
		if (this.time.length > 25) this.time.shift();
		this.trace.trace(msg + this.time.average().toFixed(2));
	}
});

}();

/*
---

name: "Utils.Trace"

description: "Unstable: translate shapes (i.e. zoom)"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Shapes.Rectangle

provides: Utils.Translator

...
*/

new function () {

var Point = LibCanvas.Point;

LibCanvas.namespace('Utils').Translator = atom.Class({
	initialize : function (rectTo) {
		this.rectTo = rectTo;
	},
	shapes : [],
	add : function (shape) {
		shape.translated = shape.clone();
		this.shapes.include(shape);
		return shape.translated;
	},
	rm : function (shape) {
		delete shape.translated;
		this.shapes.erase(shape);
		return this;
	},

	translate : function (rectFrom) {
		var rectTo = this.rectTo;
		var translate = function (trans, orig) {
			trans.moveTo(rectTo.translate(orig, rectFrom));
		};
		this.shapes.forEach(function (shape) {
			if (shape instanceof Point) {
				translate(shape.translated, shape);
			} else {
				var points = shape.getPoints();
				for (var i in points) translate(shape.translated[i], points[i]);
			}
		});
		return this;
	}

});

}();
 
