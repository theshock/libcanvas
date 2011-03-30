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

var global = (this.window || GLOBAL);

var LibCanvas = global.LibCanvas = atom.Class({
	Static: {
		Buffer: function (width, height, withCtx) {
			var a = Array.pickFrom(arguments), zero = (width == null || width === true);
			if (zero || width.width == null || width.height == null) {
				width   = zero ? 0 : a[0];
				height  = zero ? 0 : a[1];
				withCtx = zero ? a[0] : a[2];
			} else {
				withCtx = !!height;
				height  = width.height;
				width   = width.width
			}
			
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
		extract: function (to) {
			to = to || global;

			for (var i in {Shapes: 1, Behaviors: 1, Utils: 1}) {
				for (var k in LibCanvas[i]) {
					to[k] = LibCanvas[i][k];
				}
			}
			for (i in {Point: 1, Animation: 1}) {
				to[i] = LibCanvas[i];
			}
			return to;
		},

		_invoker: null,
		get invoker () {
			if (this._invoker == null) {
				this._invoker = new LibCanvas.Invoker().invoke();
			}
			return this._invoker;
		}
	},
	initialize: function() {
		return LibCanvas.Canvas2D.factory(arguments);
	}
});

atom(function () {
	LibCanvas.invoker.invoke();
});


})();

/*
---

name: "Invoker"

description: "Invoker calles functions"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Invoker

...
*/

LibCanvas.Invoker = atom.Class({
	Implements: [
		atom.Class.Options,
		atom.Class.Events
	],
	options: {
		fpsLimit : 60,
		timeCount: 5,
		context  : null,
		defaultPriority: 1
	},
	initialize: function (options) {
		this.setOptions(options);
	},
	funcs: [],
	time : [0],
	execTime: function (fn, context, args) {
		fn.apply(context, args || []);
		return ;
	},
	get minDelay () {
		return 1000 / this.options.fpsLimit;
	},
	timeoutId: 0,
	invoke: function () {
		this.fireEvent('beforeInvoke');

		var i, all = this.time,
			time   = Math.max(all.average(), this.minDelay);
		this.timeoutId = this.invoke.delay(time, this);
		
		var startTime = new Date(),
			funcs     = this.funcs.sortBy('priority'),
			ignore    = false,
			remove    = [];

		for (i = funcs.length; i--;) {
			var result = funcs[i].call(this.options.context, time);
			if (result === false) {
				ignore = true;
			} else if (result === 'remove') {
				remove.push(funcs[i]);
			}
		}
		if (!ignore) {
			all.push(new Date() - startTime);
			if (all.length > this.options.timeCount) all.shift();
		}
		for (i = remove.length; i--;) {
			this.rmFunction(remove[i]);
		}

		this.fireEvent('afterInvoke', [time]);
		return this;
	},
	after: function (timeLeft, priority, fn) {
		if (arguments.length == 2) {
			fn = priority;
			fn.priority = this.options.defaultPriority;
		}
		var timeStart = Date.now(), argTime = timeLeft;
		this.addFunction(priority, function (time) {
			timeLeft -= time;
			if (timeLeft < 0) {
				fn(Date.now() - timeStart - argTime);
				return 'remove';
			}
			return null;
		});
		return this;
	},
	stop: function () {
		this.timeoutId.stop();
		return this;
	},
	addFunction: function (priority, fn) {
		if (fn == null) {
			fn = priority;
			fn.priority = this.options.defaultPriority;
		}
		if (typeof fn != 'function') {
			throw new TypeError('Not a function');
		}
		this.funcs.push(fn);
		return this;
	},
	rmFunction: function (fn) {
		this.funcs.erase(fn);
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Invoker]')
});

LibCanvas.Invoker.AutoChoose = atom.Class({
	get invoker () {
		return 'libcanvas' in this ? this.libcanvas.invoker : LibCanvas.invoker;
	}
});

/*
---

name: "Inner.TimingFunctions"

description: "Animated Timing Functions"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Inner.TimingFunctions

inspiration:
  - "[MooTools](http://mootools.net)"

...
*/

new function () {

var math = Math;

var TF = LibCanvas.namespace('Inner').TimingFunctions = atom.Class({
	Static: {
		_instance: null,
		get instance () {
			if (!this._instance) {
				this._instance = new this;
			}
			return this._instance;
		},
		count: function (fn, progress, params) {
			if (typeof (this.instance[fn[0]]) != 'function') {
				throw new TypeError('No timing function «' + fn[0] + '»');
			}
			var In = fn.contains('in'), Out = fn.contains('out');
			if (In && !Out) {
				return this.easeIn(fn[0], progress, params);
			} else if (!In && Out) {
				return this.easeOut(fn[0], progress, params);
			} else {
				fn = fn.filter(function (name) {
					return name != 'in' && name != 'out';
				});
				if (fn.length < 2) fn[1] = fn[0];
				return this.easeInOut(fn, progress, params);
			}
		},
		easeIn: function(fn, progress, params){
			return this.instance[fn](progress, params);
		},
		easeOut: function(fn, progress, params){
			return 1 - this.instance[fn](1 - progress, params);
		},
		easeInOut: function(fn, progress, params){
			return (progress <= 0.5) ?
				this.instance[fn[0]](2 * progress, params) / 2 :
				(2 - this.instance[fn[1]](2 * (1 - progress), params)) / 2;
		}
	},

	linear: function (p) {
		return p;
	},

	pow: function(p, x){
		return math.pow(p, x && x[0] || 6);
	},

	expo: function(p){
		return math.pow(2, 8 * (p - 1));
	},

	circ: function(p){
		return 1 - math.sin(math.acos(p));
	},

	sine: function(p){
		return 1 - math.sin((1 - p) * math.PI / 2);
	},

	back: function(p, x){
		x = x && x[0] || 1.618;
		return math.pow(p, 2) * ((x + 1) * p - x);
	},

	bounce: function(p){
		var value;
		for (var a = 0, b = 1; 1; a += b, b /= 2){
			if (p >= (7 - 4 * a) / 11){
				value = b * b - math.pow((11 - 6 * a - 11 * p) / 4, 2);
				break;
			}
		}
		return value;
	},

	elastic: function(p, x){
		return math.pow(2, 10 * --p) * math.cos(20 * p * math.PI * (x && x[0] || 1) / 3);
	}
});

TF.implement(
	['quad', 'cubic', 'quart', 'quint']
		.associate(function(name, i){
			return function (p) {
				return math.pow(p, [i + 2]);
			}
		})
);

};

/*
---

name: "Utils.Color"

description: "Provides Color class"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Utils.Color

...
*/

new function () {

var math = Math;

LibCanvas.namespace('Utils').Color = atom.Class({
	Static: {
		isColorString : function (string) {
			if (typeof string != 'string') return false;
			return string in this.colorNames ||
			       string.match(/^#\w{3,6}$/) ||
			       string.match(/^rgba?\([\d, ]+\)$/);
		},
		colorNames: {
			white:  '#ffffff',
			silver: '#c0c0c0',
			gray:   '#808080',
			black:  '#000000',
			red:    '#ff0000',
			maroon: '#800000',
			yellow: '#ffff00',
			olive:  '#808000',
			lime:   '#00ff00',
			green:  '#008000',
			aqua:   '#00ffff',
			teal:   '#008080',
			blue:   '#0000ff',
			navy:   '#000080',
			fuchsia:'#ff00ff',
			purple: '#800080',
			orange: '#ffa500'
		}
	},
	r: 0,
	g: 0,
	b: 0,
	initialize: function (value) {
		var rgb = value;
		if (arguments.length == 3) {
			rgb = arguments;
		} else if (!Array.isArray(value)) {
			if (typeof value != 'string') {
				throw new TypeError('Unknown value type: ' + atom.typeOf(value));
			}
			value = value.toLowerCase();
			
			value = this.self.colorNames[value] || value;
			var hex = value.match(/^#(\w{1,2})(\w{1,2})(\w{1,2})$/);
			if (hex) {
				rgb = hex.slice(1).map(function (part) {
					if (part.length == 1) part += part;
					return parseInt(part, 16);
				});
			} else {
				rgb = value.match(/(\d{1,3})/g).map(function (value) {
					return value - 0;
				});
				if (rgb.length < 3) {
					throw new TypeError('Wrong value format: ' + atom.toArray(arguments));
				}
			}
		}
		this.r = rgb[0];
		this.g = rgb[1];
		this.b = rgb[2];
	},
	toArray: function () {
		return [this.r, this.g, this.b];
	},
	toString: function (type) {
		var arr = this.toArray();
		return type == 'hex' ?
			'#' + arr.map(function (color) {
				var bit = (color - 0).toString(16)
				return bit.length == 1 ? '0' + bit : bit;
			}).join('')
			: 'rgb(' + arr + ')';
	},
	diff: function (color) {
		if (! (color instanceof this.self)) color = this.self.factory(arguments);
		var result = [
			color.r - this.r,
			color.g - this.g,
			color.b - this.b
		];
		return result;
	},
	shift: function (array) {
		var clone = this.clone();
		clone.r += math.round(array[0]);
		clone.g += math.round(array[1]);
		clone.b += math.round(array[2]);
		return clone;
	},
	dump: function () {
		return '[Color(' + this + ')]';
	},
	clone: function () {
		return new this.self(this.r, this.g, this.b);
	}
});

}();

/*
---

name: "Behaviors.Animatable"

description: "Basic abstract class for animatable objects."

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Invoker
	- Inner.TimingFunctions
	- Utils.Color

provides: Behaviors.Animatable

...
*/

(function (LibCanvas) {

var TF    = LibCanvas.Inner.TimingFunctions,
	Color = LibCanvas.Utils.Color;

LibCanvas.namespace('Behaviors').Animatable = atom.Class({
	Implements: [LibCanvas.Invoker.AutoChoose],

	initialize: atom.Class.hiddenMethod(function (element) {
		this.animate.element = element;
		this.animate.func    = atom.typeOf(element) == 'function';
	}),

	animatedProperties : {},

	animate : function (key, value) {
		var args, elem = this.animate.element || this, isFn = !!this.animate.func;

		if (typeof key == 'string' && arguments.length == 2) {
			args = {};
			args[key] = value;
		} else {
			args = key;
		}

		if (!isFn && !args.props) {
			args = { props : args };
		}
		args = atom.extend({
			fn    : 'linear',
			params: [],
			time  : 500,
		}, args);

		if (!Array.isArray(args.fn)) {
			args.fn = args.fn.split('-');
		}

		args.params = Array.from(args.params);

		var timeLeft = args.time,
			diff     = {},
			start    = {},
			inAction = this.animatedProperties,
			invoker  = this.invoker;

		var animation = {
			repeat: function () {
				this.animate(args);
			}.context(this),
			stop : function () {
				// avoid calling twice
				animation.stop = function () { return this };

				if (isFn) for (var i in args.props) inAction[i] = null;
				invoker.rmFunction(fn);
				args.onAbort && args.onAbort.call(this, animation, start);
				return this;
			}.context(this),
			instance: this
		};
		
		var fn = function (time) {
			var timeElapsed = Math.min(time, timeLeft);

			timeLeft -= timeElapsed;

			var progress = (args.time - timeLeft) / args.time;

			var factor = TF.count(args.fn, progress, args.params);

			if (isFn) {
				elem(factor);
			} else {
				for (var i in diff) {
					if (start[i] instanceof Color) {
						elem[i] = start[i].shift(diff[i].map(function(elem) {
							return elem * factor;
						})).toString();
					} else {
						elem[i] = start[i] + diff[i] * factor;
					}
				}
			}

			args.onProccess && args.onProccess.call(this, animation, start);

			if (timeLeft <= 0) {
				args.onFinish && invoker.after(0, function() {
					args.onFinish.call(this, animation, start);
				}.context(this));
				return 'remove';
			}

			return true;
		}.context(this);



		if (!isFn) for (var i in args.props) {
			// if this property is already animating - remove
			if (i in inAction) invoker.rmFunction(inAction[i]);
			inAction[i] = fn;
			if (Color.isColorString(elem[i])) {
				start[i] = new Color(elem[i]);
				diff[i]  = start[i].diff(args.props[i]);
			} else {
				start[i] = elem[i];
				diff[i]  = args.props[i] - elem[i];
			}
		}

		invoker.addFunction(20, fn);
		return animation;
	}
});

})(LibCanvas);

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
	Implements: [atom.Class.Events],
	Static: {
		from : function (obj) {
			return (typeof obj == 'object' && obj[0] instanceof this) ? obj[0]
					: (obj instanceof this ? obj : new this(obj));
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
		this.fireEvent('move', [this.invertDirection(distance, reverse)]);
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Geometry]')
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
new function () {


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
	},

	toSeconds: function () {
		return this / 1000;
	},
	toMinutes: function () {
		return this / 60 / 1000;
	},
	toHours: function () {
		return this / 60 / 60 / 1000;
	},

	seconds: function () {
		return this * 1000;
	},
	minutes: function () {
		return this * 60 * 1000;
	},
	hours: function () {
		return this * 60 * 60 * 1000;
	}

});

for (var degree in [0, 45, 90, 135, 180, 225, 270, 315, 360].toKeys()) {
	degreesCache[degree] = (degree * 1).degree();
}
var d360 = degreesCache[360];

};

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

new function (undefined) {

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
		var args = arguments;
		if (atom.typeOf(x) == 'arguments') {
			args = x;
			x = args[0];
			y = args[1];
		}
		if (args.length != 2) {
			if (x && x[0] !== undefined && x[1] !== undefined) {
				y = x[1];
				x = x[0];
			} else if (x && x.x !== undefined && x.y !== undefined) {
				y = x.y;
				x = x.x;
			} else {
				//atom.log('Wrong Arguments In Point.Set:', arguments);
				throw new TypeError('Wrong Arguments In Point.Set: [' + atom.toArray(arguments).join(', ') + ']');
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
	moveTo : function (newCoord) {
		return this.move(this.diff(newCoord));
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
	equals : function (to, accuracy) {
		to = Point.from(to);
		return accuracy == null ? (to.x == this.x && to.y == this.y) :
			(this.x.equals(to.x, accuracy) && this.y.equals(to.y, accuracy));
	},
	toObject: function () {
		return {
			x: this.x,
			y: this.y
		};
	},
	snapToPixel: function () {
		this.x += 1 - (this.x - this.x.floor()) - 0.5;
		this.y += 1 - (this.y - this.y.floor()) - 0.5;
		return this;
	},
	clone : function () {
		return new Point(this);
	},
	dump: function () {
		return '[Point(' + this.x + ', ' + this.y + ')]';
	},
	toString: Function.lambda('[object LibCanvas.Point]')
});

};

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
		var maxOverMouseLCZ = 0, maxOverMouseZ = 0, sub = this.subscribers;
		sub.sort(function ($0, $1) {
			var diff = $1.libcanvas.zIndex - $0.libcanvas.zIndex;
			if (diff) return diff < 0 ? -1 : 1;
			diff = $1.getZIndex() - $0.getZIndex();
			return diff ? (diff < 0 ? -1 : 1) : 0;
		});
		
		
		for (var i = 0, l = sub.length; i < l; i++) {
			var elem = sub[i];
			
			if (elem.getZIndex() >= maxOverMouseZ
			 && elem.libcanvas.zIndex >= maxOverMouseLCZ
			 && this.overElem(elem)) {
				maxOverMouseZ   = elem.getZIndex();
				maxOverMouseLCZ = elem.libcanvas.zIndex;
				elements.over.push(elem);
			} else {
				elements.out.push(elem);
			}
		}
		return elements;
	},
	fireEvent : function (elem, eventName, e) {
		elem.fireEvent(eventName, [e, eventName]);
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
			atom().bind({
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
		var mouse = this, waitEvent = function (event, isOffise) {
			return function (e) {
				var wait = mouse.isEventAdded(event);
				if (isOffise || wait) mouse.getOffset(e);
				if (isOffise) mouse.events.event(event, e);
				if (wait) mouse.fireEvent(event, [e]);
				return !isOffise;
			};
		};
		
		atom(mouse.elem).bind({
			/* bug in Linux Google Chrome
			 * if moving mouse while some text is selected
			 * mouse becomes disable.
			 */
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
			selectstart: false
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

events:
	- click
	- mouseover
	- mousemove
	- mouseout
	- mouseup
	- mousedown
	- away:mouseover
	- away:mousemove
	- away:mouseout
	- away:mouseup
	- away:mousedown

...
*/

// Should extends LibCanvas.Behaviors.Drawable
LibCanvas.namespace('Behaviors').MouseListener = atom.Class({
	listenMouse : function (stopListen) {
		return this.addEvent('libcanvasSet', function () {
			var command = stopListen ? "unsubscribe" : "subscribe";
			this.libcanvas.mouse[command](this);
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
	- Behaviors.MouseListener

provides: Behaviors.Clickable

...
*/

new function () {

var setValFn = function (object, name, val) {
	return function () {
		object[name] = val;
		object.fireEvent('statusChanged');
	};
};

// Should extends drawable, implements mouseListener
LibCanvas.namespace('Behaviors').Clickable = atom.Class({
	Implements: [LibCanvas.Behaviors.MouseListener],

	clickable : function () { 
		this.listenMouse();

		var fn = setValFn.context(null, [this]);
		
		this.addEvent('mouseover', fn('hover', true));
		this.addEvent('mouseout' , fn('hover', false));
		this.addEvent('mousedown', fn('active', true));
		this.addEvent(['mouseup', 'away:mouseout', 'away:mouseup'],
			fn('active', false));
		return this;
	}
});

};

/*
---

name: "Behaviors.Draggable"

description: "When object implements LibCanvas.Behaviors.Draggable interface dragging made possible"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.MouseListener

provides: Behaviors.Draggable

...
*/

new function () {

LibCanvas.namespace('Behaviors').Draggable = atom.Class({
	isDraggable : null,
	dragStart : null,
	returnToStart : function (speed) {
		return !this.dragStart ? this : this.moveTo(this.dragStart, speed);
	},
	draggable : function (stopDrag) {
		if (this.isDraggable === null) {
			this.addEvent('libcanvasSet', initDraggable.context(this));
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
		this.fireEvent('moveDrag', [move]);
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
		.addEvent(startDrag, function () {
			if (this.isDraggable) {
				this.fireEvent('startDrag');
				if (this.getCoords) this.dragStart = this.getCoords().clone();
				this.prevMouseCoord = this.libcanvas.mouse.point.clone();
				this.addEvent(dragging, dragFn);
			}
		})
		.addEvent(stopDrag, function () {
			if (this.isDraggable && this.prevMouseCoord) {
				this.fireEvent('stopDrag').removeEvent(dragging, dragFn);
				delete this.prevMouseCoord;
			}
		});
};

};

/*
---

name: "Behaviors.Drawable"

description: "Abstract class for drawable canvas objects"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Behaviors.Drawable

...
*/

new function () {
	
var start = function () {
	this.libcanvas.addElement(this);
	return 'remove';
};
var stop = function () {
	this.libcanvas.addElement(this);
	return 'remove';
};

LibCanvas.namespace('Behaviors').Drawable = atom.Class({
	Implements: [atom.Class.Events],
	libcanvasIsReady: false,
	setLibcanvas : function (libcanvas) {
		if (this.libcanvas) {
			this.libcanvas.rmElement(this)
			this.libcanvas = libcanvas;
		} else {
			this.libcanvas = libcanvas;
			this.addEvent('libcanvasReady', function () {
				this.libcanvasIsReady = true;
			})
			this.readyEvent('libcanvasSet');
			this.libcanvas.addEvent('ready', this.readyEvent.context(this, ['libcanvasReady']));
		}
		return this;
	},
	isReady : function () {
		return this.libcanvasIsReady;
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
	toLayer: function (name) {
		this.libcanvas.layer(name)
			.addElement(this);
		return this;
	},
	startDrawing: function () {
		return this
		  .removeEvent('libcanvasSet', stop)
		     .addEvent('libcanvasSet', start);
	},
	stopDrawing: function () {
		return this
		  .removeEvent('libcanvasSet', start)
		     .addEvent('libcanvasSet', stop);
	},
	draw : atom.Class.abstractMethod
});

};

/*
---

name: "Behaviors.Droppable"

description: "Abstract class for droppable canvas objects"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
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
			this.addEvent('stopDrag', function () {
				var dropped = false;
				var mouse = this.libcanvas.mouse;
				if (mouse.inCanvas) {
					this.drops.forEach(function (obj) {
						if(obj.getShape().hasPoint(mouse.point)) {
							dropped = true;
							this.fireEvent('dropped', [obj]);
						}
					}.context(this));
				}
				if (!dropped) this.fireEvent('dropped', [null]);
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
			this.getShape().addEvent('move',
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
	- Behaviors.Animatable

provides: Behaviors.Moveable

...
*/
LibCanvas.namespace('Behaviors').Moveable = atom.Class({
	stopMoving : function () {
		var sm = this.stopMoving;
		if (sm.animation) {
			sm.animation.stop();
		}
		return this;
	},
	moveTo    : function (point, speed, fn) { // speed == pixels per sec
		this.stopMoving();
		point = LibCanvas.Point.from(point);
		var diff = this.getCoords().diff(point), shape = this.getShape();
		if (!speed) {
			shape.move(diff);
			this.fireEvent('stopMove')
			return this;
		}
		var distance = Math.hypotenuse(diff.x, diff.y), prev = 0;

		this.stopMoving.animation = new LibCanvas.Behaviors.Animatable(function (change) {
			shape.move({
				x : diff.x * (change - prev),
				y : diff.y * (change - prev)
			});
			prev = change;
		}).animate({
			fn        : fn,
			time      : distance / speed * 1000,
			onProccess: this.fireEvent.context(this, ['move']),
			onAbort   : this.fireEvent.context(this, ['stopMove']),
			onFinish  : this.fireEvent.context(this, ['stopMove'])
		});

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

provides: Animation

...
*/

LibCanvas.Animation = atom.Class({
	Implements: [atom.Class.Events],
	sprites : {},
	addSprite : function (index, sprite) {
		this.sprites[index] = sprite;
		return this;
	},
	addSprites : function (sprites, width) {
		if (atom.typeOf(sprites) == 'object') {
			atom.extend(this.sprites, sprites);
		} else {
			for (var w = 0; (w * width) < sprites.width; w++) {
				this.addSprite(w, sprites.sprite(width*w, 0, width, sprites.height));
			}
		}
		return this;
	},
	defaultSprite : null,
	setDefaultSprite : function (index) {
		this.defaultSprite = index;
		return this;
	},
	getSprite : function () {
		return this.getFrame() ? this.sprites[this.getFrame().sprite] : 
			this.defaultSprite != null ? this.sprites[this.defaultSprite] : null;
	},

	animations : {},
	add : function (animation) {
		if (!animation.frames && animation.line) {
			animation.frames = [];
			animation.line.forEach(function (f, i) {
				animation.frames.push({sprite: f, delay: animation.delay, name: i});
			});
			delete animation.line;
			return this.add(animation);
		}
		this.animations[animation.name] = animation;
		return this;
	},

	singleAnimationId: 0,
	runOnce: function (cfg) {
		var name = '_singleAnimation' + this.singleAnimationId++;
		return this
			.add(atom.extend({
				name : name,
				delay: 40
			}, cfg))
			.run(name);
	},

	current : null,
	queue : [],
	run : function (name, cfg) {
		if (typeof name != 'string') {
			return this.runOnce(name);
		}
		if (!name in this.animations) {
			throw new Error('No animation «' + name + '»');
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
		return next != null && this.init(next);
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
		if (!this.current) return this;
		
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
			this.fireEvent('changed', [frameName, aniName]);
			this.fireEvent(frameName, [frameName, aniName]);
			// use invoker instead
			if (frame.delay != null) this.nextFrame.delay(frame.delay, this);
		} else {
			this.fireEvent('changed', ['stop:' + aniName]);
			this.fireEvent('stop:' + aniName, ['stop:' + aniName]);
			this.fireEvent('stop', [aniName]);
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
		return index in this.current.cfg ?
			this.current.cfg[index] :
			this.current.animation[index];
	},
	toString: Function.lambda('[object LibCanvas.Animation]')
});


/*
---

name: "Utils.Trace"

description: "Useful tool which provides windows with user-defined debug information"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Utils.Trace

...
*/

new function () {

var Trace = LibCanvas.namespace('Utils').Trace = atom.Class({
	Static: {
		dumpRec : function (obj, level, plain) {
			level  = parseInt(level) || 0
			
			var escape = function (v) {
				return plain ? v : v.safeHtml();
			};

			if (level > 5) return '*TOO_DEEP*';

			if (typeof obj == 'object' && typeof(obj.dump) == 'function') return obj.dump();

			var subDump = function (elem, index) {
					return tabs + '\t' + index + ': ' + this.dumpRec(elem, level+1, plain) + '\n';
				}.context(this),
				type = atom.typeOf(obj),
				tabs = '\t'.repeat(level);

			switch (type) {
				case 'array':
					return '[\n' + obj.map(subDump).join('') + tabs + ']';
					break;
				case 'object':
					var html = '';
					for (var index in obj) html += subDump(obj[index], index);
					return '{\n' + html + tabs + '}';
				case 'element':
					var prop = (obj.width && obj.height) ? '('+obj.width+'×'+obj.height+')' : '';
					return '[DOM ' + obj.tagName.toLowerCase() + prop + ']';
				case 'textnode':
				case 'whitespace':
					return '[DOM ' + type + ']';
				case 'null':
					return 'null';
				case 'boolean':
					return obj ? 'true' : 'false';
				case 'string':
					return escape('"' + obj + '"');
				default:
					return escape('' + obj);
			}
		},
		dumpPlain: function (object) {
			return (this.dumpRec(object, 0, true));
		},
		dump : function (object) {
			return (this.dumpRec(object, 0));
		}
	},
	initialize : function (object) {
		if (arguments.length) this.trace(object);
		this.stopped = false;
		return this;
	},
	stop  : function () {
		this.stopped = true;
		return this;
	},
	set value (value) {
		if (!this.stopped && !this.blocked) {
			var html = this.self.dump(value)
				.replaceAll({
					'\t': '&nbsp;'.repeat(3),
					'\n': '<br />'
				});
			this.createNode().html(html);
		}
	},
	trace : function (value) {
		this.value = value;
		return this;
	},
	getContainer : function () {
		var cont = atom('#traceContainer');
		return cont.length ? cont :
			atom().create('div', { 'id' : 'traceContainer'})
				.css({
					'zIndex'   : '87223',
					'position' : 'absolute',
					'top'      : '3px',
					'right'    : '6px',
					'maxWidth' : '70%'
				})
				.appendTo('body');
	},
	events : function (remove) {
		var trace = this;
		// add events unbind
		!remove || this.node.bind({
			mouseover : function () {
				this.css('background', '#222');
			},
			mouseout  : function () {
				this.css('background', '#000');
			},
			mousedown : function () {
				trace.blocked = true;
			},
			mouseup : function () {
				trace.blocked = false;
			}
		});
		return this.node;
	},
	destroy : function () {
		this.node.css('background', '#300');
		this.timeout = (function () {
			if (this.node) {
				this.node.destroy();
				this.node = null;
			}
		}.delay(500, this));
		return this;
	},
	createNode : function () {
		if (this.node) {
			if (this.timeout) {
				this.timeout.stop();
				this.events(this.node);
				this.node.css('background', '#000');
			}
			return this.node;
		}

		this.node = atom()
			.create('div')
			.css({
				background : '#000',
				border     : '1px dashed #0c0',
				color      : '#0c0',
				cursor     : 'pointer',
				fontFamily : 'monospace',
				margin     : '1px',
				minWidth   : '200px',
				overflow   : 'auto',
				padding    : '3px 12px',
				whiteSpace : 'pre'
			})
			.appendTo(this.getContainer())
			.bind({
				click    : this.destroy.context(this),
				dblclick : function () { this.stop().destroy(); }.context(this)
			});
		return this.events();
	},
	toString: Function.lambda('[object LibCanvas.Utils.Trace]')
});

window.trace = function (msg) {
	var L = arguments.length;
	if (L > 0) {
		if (L > 1) msg = atom.toArray(arguments);
		return new Trace(msg);
	} else {
		return new Trace();
	}
};

}();

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
	- Utils.Trace

provides: Inner.FrameRenderer

...
*/

LibCanvas.namespace('Inner').FrameRenderer = atom.Class({
	checkAutoDraw : function () {
		if (!this._freezed && this.updateFrame) {
			this.updateFrame = false;
			return true;
		}
		return false;
	},
	showBuffer : function () {
		if (this.elem != this.origElem) {
			this.origCtx.clearAll();
			this.origCtx.drawImage(this.elem);
		}
		return this;
	},
	drawAll : function () {
		var elems = this.elems.sortBy('getZIndex');
		for (var i = elems.length; i--;) {
			if (elems[i].isReady()) {
				elems[i].draw();
			}
		}
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
	},
	innerInvoke : function (type, time) {
		var f = this.funcs[type].sortBy('priority');
		for (var i = f.length; i--;) f[i].call(this, time);
		return this;
	},
	renderLayer: function (layer, time) {
		layer.innerInvoke('plain', time);
		if (layer.checkAutoDraw()) {
			layer.processing('pre');
			if (layer.isReady()) {
				layer.innerInvoke('render', time);
				layer.drawAll();
			} else {
				layer.renderProgress();
			}
			layer.processing('post');
			layer.showBuffer();
			return true;
		}
		return false;
	},
	renderFrame : function (time) {
		for (var n in this._layers) {
			this.renderLayer(this._layers[n], time);
		}
		return true;
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
	},
	toString: Function.lambda('[object LibCanvas.Utils.FpsMeter]')
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
		return this.addEvent('frameRenderStarted', function () {
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
	get x () {
		return this.getCoords().x;
	},
	get y () {
		return this.getCoords().y;
	},
	set x (x) {
		return this.move({ x : x - this.x, y : 0 });
	},
	set y (y) {
		return this.move({ x : 0, y : y - this.y });
	},
	getCenter : function () {
		return new LibCanvas.Point(
			(this.from.x + this.to.x) / 2,
			(this.from.y + this.to.y) / 2
		);
	},
	move : function (distance, reverse) {
		distance = this.invertDirection(distance, reverse);
		this.from.move(distance);
		this. to .move(distance);
		return this.parent(distance);
	},
	equals : function (shape, accuracy) {
		return shape.from.equals(this.from, accuracy) && shape.to.equals(this.to, accuracy);
	},
	clone : function () {
		return new this.self(this.from.clone(), this.to.clone());
	},
	getPoints : function () {
		return { from : this.from, to : this.to };
	},
	dump: function (shape) {
		if (!shape) return this.toString();
		var p = function (p) { return '[' + p.x + ', ' + p.y + ']'; };
		return '[shape ' + shape + '(from'+p(this.from)+', to'+p(this.to)+')]';
	},
	toString: Function.lambda('[object LibCanvas.Shape]')
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

var Point  = LibCanvas.Point,
	math   = Math,
	random = Number.random,

Rectangle = LibCanvas.namespace('Shapes').Rectangle = atom.Class({
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

	get width() {
		return this.to.x - this.from.x;
	},
	get height() {
		return this.to.y - this.from.y;
	},
	set width (width) {
		this.to.moveTo({ x : this.from.x + width, y : this.to.y });
	},
	set height (height) {
		this.to.moveTo({ x : this.to.x, y : this.from.y + height });
		return this;
	},
	get size () {
		return {
			width : this.width,
			height: this.height
		};
	},
	set size (size) {
		this.width  = size.width;
		this.height = size.height;
	},
	// @deprecated 
	getWidth : function () {
		return this.width;
	},
	// @deprecated
	getHeight : function () {
		return this.height;
	},
	// @deprecated 
	setWidth : function (width) {
		this.width = width;
		return this;
	},
	// @deprecated
	setHeight : function (height) {
		this.height = height;
		return this;
	},
	hasPoint : function (point, padding) {
		point   = Point.from(arguments);
		padding = padding || 0;
		return point.x != null && point.y != null
			&& point.x.between(math.min(this.from.x, this.to.x) + padding, math.max(this.from.x, this.to.x) - padding, 1)
			&& point.y.between(math.min(this.from.y, this.to.y) + padding, math.max(this.from.y, this.to.y) - padding, 1);
	},
	moveTo: function (rect) {
		rect = Rectangle.from(arguments);
		this.from.moveTo(rect.from);
		this.  to.moveTo(rect.to);
		return this;
	},
	draw : function (ctx, type) {
		// fixed Opera bug - cant drawing rectangle with width or height below zero
		ctx.original(type + 'Rect', [
			math.min(this.from.x, this.to.x),
			math.min(this.from.y, this.to.y),
			this.width .abs(),
			this.height.abs()
		]);
		return this;
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
			random(margin, this.width  - margin),
			random(margin, this.height - margin)
		);
	},
	translate : function (point, fromRect) {
		var diff = fromRect.from.diff(point);
		return new Point({
			x : (diff.x / fromRect.width ) * this.width,
			y : (diff.y / fromRect.height) * this.height
		});
	},
	snapToPixel: function () {
		this.from.snapToPixel();
		this.to.snapToPixel();
		return this;
	},
	dump: function () {
		return this.parent('Rectangle');
	},
	toString: Function.lambda('[object LibCanvas.Shapes.Rectangle]')
});

};

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
	Implements: [atom.Class.Events],
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
	},
	onProcessed : function (type) {
		this.count[type]++;
		this.processed++;
		if (this.isReady()) this.readyEvent('ready', [this]);
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
			})
			.get();
	},
	createImages : function (images) {
		var imgs = {};
		for (var i in images) imgs[i] = this.createImage(images[i], i);
		return imgs;
	},
	ready : function (fn) {
		this.addEvent('ready', fn);
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Utils.ImagePreloader]')
});

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
new function (){


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
		this.points.empty().append(
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
		distance = this.invertDirection(distance, reverse);
		this.points.invoke('move', distance);
		this.fireEvent('move', [distance]);
		return this;
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
	},
	clone: function () {
		return new this.self(this.points);
	},
	toString: Function.lambda('[object LibCanvas.Shapes.Polygon]')
});

};

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
	- Shapes.Rectangle
	- Shapes.Polygon
	- Shapes.Polygon
	- Behaviors.Animatable

provides: Utils.ProgressBar

...
*/

(function (LibCanvas) {

var Buffer    = LibCanvas.Buffer,
	Rectangle = LibCanvas.Shapes.Rectangle,
	Polygon   = LibCanvas.Shapes.Polygon,
	Point     = LibCanvas.Point;

LibCanvas.namespace('Utils').ProgressBar = atom.Class({
	Implements: [LibCanvas.Behaviors.Animatable],
	initialize : function () {
		this.coord = new Point(0,0);
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
		}).snapToPixel();

		this.libcanvas.ctx
			.fillAll(s['bgColor'])
			.fill   (pbRect, s['barBgColor'])
			.stroke (pbRect, s['borderColor']);
		return this;
	},
	drawLine : function () {
		if (this.progress > 0) {
			var line = this.line;
			var prog   = this.progress;
			var width  = ((line.width  - 2) * prog).round();
			if (width > 1) {
				var height = line.height - 2;
				var c = this.coord;

				this.libcanvas.ctx.drawImage({
					image : line,
					crop  : [    0,    0 , width-1, height-1],
					draw  : [c.x+1, c.y+1, width-1, height-1]
				});
			}
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
		this.update().animate({
			props: {progress: progress},
			fn: 'circ-in',
			onProccess: this.update.context(this),
			time: 200
		});
		return this;
	},
	setStyle : function (newStyle) {
		this.update().style = newStyle;
		return this.preRender();
	},
	update: function () {
		if (this.libcanvas) this.libcanvas.update();
		return this;
	},
	draw : function () {
		this.libcanvas.ctx.save();
		this.drawBorder().drawLine();
		this.libcanvas.ctx.restore();
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Utils.ProgressBar]')
});

})(LibCanvas);

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
	getImage : function (name) {
		if (this.parentLayer) return this.parentLayer.getImage(name);
		
		if (this.images && this.images[name]) {
			return this.images[name];
		} else {
			throw new Error('No image «' + name + '»');
		}
	},
	getAudio: function (name) {
		if (this.parentLayer) return this.parentLayer.getAudio(name);
		
		if (this._audio) {
			var audio = this._audio.get(name);
			if (audio) return audio;
		}
		throw new Error('No audio «' + name + '»');
	},
	renderProgress : function () {
		if (this.parentLayer) return;
		
		if (this.options.progressBarStyle && !this.progressBar) {
			this.progressBar = new LibCanvas.Utils.ProgressBar()
				.setStyle(this.options.progressBarStyle);
		}
		if (this.progressBar) {
			this.progressBar
				.setLibcanvas(this)
				.setProgress(this.imagePreloader.getProgress())
				.draw();
		}
	},
	createPreloader : function () {
		if (!this.imagePreloader) {
			
			if (this.parentLayer) {
				this.parentLayer.addEvent('ready', function () {
					this.readyEvent('ready');
				}.context(this));
				this.imagePreloader = true;
				return;
			}
			
			if (this.options.preloadAudio) {
				this._audio = new LibCanvas.Utils.AudioContainer(this.options.preloadAudio);
			} else {
				this._audio = null;
			}

			if (this.options.preloadImages) {
				this.imagePreloader = new LibCanvas.Utils.ImagePreloader(this.options.preloadImages)
					.addEvent('ready', function (preloader) {
						this.images = preloader.images;
						atom.log(preloader.getInfo());
						this.readyEvent('ready');
						this.update();
					}.context(this));
			} else {
				this.images = {};
				this.imagePreloader = true;
				this.readyEvent('ready');
			}
		}

	},
	isReady : function () {
		this.createPreloader();
		if (this.parentLayer) return this.parentLayer.isReady();
		return !this.options.preloadImages || (this.imagePreloader && this.imagePreloader.isReady());
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

provides: Canvas2D

...
*/

LibCanvas.Canvas2D = atom.Class({
	Extends: LibCanvas,
	Implements: [
		LibCanvas.Inner.FrameRenderer,
		LibCanvas.Inner.FpsMeter,
		LibCanvas.Inner.DownloadingProgress,
		atom.Class.Events,
		atom.Class.Options
	],

	Generators: {
		mouse: function () {
			throw new Error('Mouse is not listened by libcanvas');
		},
		keyboard: function () {
			throw new Error('Keyboard is not listened by libcanvas');
		},
		wrapper: function () {
			var wrapper = atom().create('div').css({
				width   : '100%',
				height  : '100%',
				overflow: 'hidden',
				position: 'absolute'
			});
			wrapper.parent = atom().create('div').addClass('libcanvas-layers-container');
			return wrapper.appendTo(wrapper.parent);
		},
		invoker: function () {
			return new LibCanvas.Invoker({
				context: this,
				defaultPriority: 10,
				fpsLimit: this.options.fps
			});
		}
	},

	options: {
		name: 'main',
		autoStart: true,
		clear: true,
		backBuffer: 'on',
		fps: 30
	},

	// @deprecated
	set fps (value) {
		this.options.fps = value;
	},
	get fps () {
		return this.options.fps;
	},
	// @deprecated
	set autoUpdate (value) { },
	get autoUpdate () { return true; },
	interval   : null,
	name: null,

	initialize : function (elem, options) {
		if (typeof elem == 'string') elem = atom(elem);
		if (atom.isAtom(elem)) elem = elem.get();

		this.setOptions(options);

		this.origElem = elem;
		this.origCtx = elem.getContext('2d-libcanvas');
		var aElem = this.origElem.atom = atom(elem)
			.css('position', 'absolute');

		this.createProjectBuffer().addClearer();

		if (this.parentLayer) {
			aElem.appendTo(this.wrapper);
		} else {
			this.name = this.options.name;
			this._layers[this.name] = this;
			aElem
				.attr('data-layer-name', this.name)
				.replaceWith(this.wrapper.parent)
				.appendTo(this.wrapper);
			
			if (elem.width && elem.height) {
				this.size(elem.width, elem.height, true);
			}
		}

		this.update = this.update.context(this);

		if (this.options.autoStart) this.isReady();

		this.addEvent('ready', function () {
			this.update.delay(0)
		});
		
		this.zIndex = Infinity;
	},
	
	show: function () {
		this.origElem.atom.css('display', 'block');
		return this;
	},
	
	hide: function () {
		this.origElem.atom.css('display', 'hide');
		return this;
	},

	size: function (size, height, wrapper) {
		if (typeof size == 'object') {
			wrapper = height;
		} else {
			size = { width: size, height: height };
		}
		for (var i in size) {
			if (this.origElem != this.elem) {
				this.origElem[i] = size[i];
			}
			this.elem[i] = size[i];
			
			if (wrapper) {
				this.wrapper       .css(i, size[i]);
				this.wrapper.parent.css(i, size[i]);
			}
		}
		return this;
	},
	
	shift: function (shift, left) {
		if (left != null) {
			shift = { top: shift, left: left };
		}
		this.origElem.atom.css({
			'margin-top' : shift.top,
			'margin-left': shift.left
		});
		return this;
	},

	createProjectBuffer: atom.Class.protectedMethod(function () {
		if (this.options.backBuffer == 'off') {
			this.elem = this.origElem;
			this.ctx  = this.origCtx;
		} else {
			this.elem = this.createBuffer();
			this.ctx  = this.elem.getContext('2d-libcanvas');
		}
		return this;
	}),

	addClearer: atom.Class.protectedMethod(function () {
		var clear = this.options.clear;
		if (clear != null) {
			this.addProcessor('pre',
				new LibCanvas.Processors.Clearer(
					typeof clear === 'string' ? clear : null
				)
			);
		}
		return this;
	}),

	updateFrame : true,
	update : function (cancel) {
		this.updateFrame = true;
		return this;
	},
	_freezed: false,
	freeze: function (unfreeze) {
		this._freezed = !unfreeze;
	},
	listenMouse : function (elem) {
		this._mouse = LibCanvas.isLibCanvas(elem) ? elem.mouse
			: new LibCanvas.Mouse(this, /* preventDefault */elem);
		return this;
	},
	getKey : function (key) {
		return this.keyboard.keyState(key);
	},
	listenKeyboard : function (elem) {
		this._keyboard = LibCanvas.isLibCanvas(elem) ? elem.keyboard
			: new LibCanvas.Keyboard(this, /* preventDefault */elem);
		return this;
	},
	createBuffer : function (width, height) {
		return LibCanvas.Buffer.apply(LibCanvas,
			arguments.length ? arguments :
				Array.collect(this.origElem, ['width', 'height'])
		);
	},
	createShaper : function (options) {
		var shaper = new LibCanvas.Ui.Shaper(this, options);
		this.addElement(shaper);
		return shaper;
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
		this.elems.include(elem);
		elem.setLibcanvas(this)
		return this;
	},
	rmElement : function (elem) {
		this.elems.erase(elem);
		return this;
	},

	// Each frame funcs

	funcs : {
		plain : [],
		render: []
	},
	addFunc: function (priority, fn, isRender) {
		if (fn == null) {
			fn = priority;
			priority = fn.priority || 10;
		}
		var f = this.funcs;
		if (!f.plain.contains(fn) && !f.render.contains(fn)) {
			f[isRender ? 'render' : 'plain'].push(fn);
		}
		return this;
	},
	addRender: function (priority, fn) {
		return this.addFunc(priority, fn, true);
	},
	rmFunc : function (fn) {
		var f = this.funcs;
		f.plain.erase(fn);
		f.render.erase(fn);
		return this;
	},

	// Start, pause, stop
	start : function (fn) {
		fn && this.addRender(10, fn);
		if (this.invoker.timeoutId == 0) {
			this.invoker
				.addFunction(0, this.renderFrame)
				.addEvent('beforeInvoke', this.fireEvent.context(this, ['frameRenderStarted']))
				.addEvent( 'afterInvoke', this.fireEvent.context(this, ['frameRenderFinished']));
		}
		this.invoker.invoke();
		return this;
	},
	stop: function () {
		this.invoker.stop();
		return this;
	},

	_layers: {},
	parentLayer: null,
	layer: function (name) {
		if (!name) {
			// gettin master layer
			return this.parentLayer == null ? this : this.parentLayer.layer();
		}
		
		if (name in this._layers) {
			return this._layers[name];
		} else {
			throw new Error('No layer «' + name + '»');
		}
	},
	
	createLayer: function (name, z) {
		if (name in this._layers) {
			throw new Error('Layer «' + name + '» already exists');
		}
		var layer = this._layers[name] = new LibCanvas.Layer(this, this.options);
		layer._layers = this._layers;
		layer.zIndex  = z;
		layer.name    = name;
		layer.origElem.atom.attr({ 'data-layer-name': name });
		return layer;
	},
	
	get topLayer () {
		var max = 0, layers = this._layers, nameMax = null;
		for (var name in layers) if (layers[name].zIndex > max) {
			nameMax = name;
			max     = layers[name].zIndex;
		}
		return layers[nameMax] || null;
	},
	
	get maxZIndex () {
		var top = this.topLayer;
		return top ? top.zIndex : 1;
	},
	
	_zIndex: null,
	
	set zIndex (value) {
		var set = function (layer, z) {
			layer._zIndex = z;
			layer.origElem.atom.css('zIndex', z);
			layer.showBuffer();
		};
		
		var current = this._zindex;
		
		if (value == null) value = Infinity;
		value = value.limit(1, this.maxZIndex + (current ? 1 : 0));
		
		current = current || Infinity;
		
		for (var i in this._layers) if (this._layers[i] != this) {
			var l = this._layers[i], z = l._zIndex;
			if (current > z && value <= z) set(l, z+1);
			if (current < z && value >= z) set(l, z-1);
		}
		set(this, value);
	},
	
	get zIndex () {
		return this._zIndex;
	},

	// not clonable
	get clone () {
		return this;
	},
	dump: function () {
		var el = this.elem, 
			pr = [
				'"' + this.name + '"',
				'z=' + this.zIndex,
				'e=' + this.elems.length
			].join(',');
		return '[LibCanvas(' + pr + ')]';
	},
	toString: Function.lambda('[object LibCanvas.Canvas2D]')
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
		if (this.center == null) throw new TypeError('center is null');
		if (this.radius == null) throw new TypeError('radius is null');
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
	getCenter: function () {
		return this.center;
	},
	intersect : function (obj) {
		if (obj instanceof this.self) {
			return this.center.distanceTo(obj.center) < this.radius + obj.radius;
		}
		return false;
	},
	move : function (distance, reverse) {
		distance = this.invertDirection(distance, reverse);
		this.center.move(distance);
		this.fireEvent('move', [distance]);
		return this;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		if (this.radius) {
			ctx.arc({
				circle : this,
				angle  : [0, (360).degree()]
			});
		}
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	clone : function () {
		return new this.self(this.center.clone(), this.radius);
	},
	getPoints : function () {
		return { center : this.center };
	},
	dump: function () {
		return '[shape Circle(center['+this.center.x+', '+this.center.y+'], '+this.radius+')]';
	},
	toString: Function.lambda('[object LibCanvas.Shapes.Circle]')
});

}();

/*
---

name: "Utils.Canvas"

description: "Provides some Canvas extensions"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Utils.Canvas

...
*/

atom.extend(HTMLCanvasElement, {
	_newContexts: {},
	addContext: function (name, ctx) {
		this._newContexts[name] = ctx;
		return this;
	},
	getContext: function (name) {
		return this._newContexts[name] || null;
	}
});

atom.implement(HTMLCanvasElement, {
	getOriginalContext: HTMLCanvasElement.prototype.getContext,
	getContext: function (type) {
		if (!this.contextsList) {
			this.contextsList = {};
		}

		if (!this.contextsList[type]) {
			var ctx = HTMLCanvasElement.getContext(type);
			if (ctx) {
				ctx = new ctx(this);
			} else try {
				ctx = this.getOriginalContext.apply(this, arguments);
			} catch (e) {
				throw (!e.toString().match(/NS_ERROR_ILLEGAL_VALUE/)) ? e :
					new TypeError('Wrong Context Type: «' + type + '»');
			}
			this.contextsList[type] = ctx;
		}
		return this.contextsList[type];
	}
});

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
	- Utils.Canvas

provides: Context2D

...
*/

(function (LibCanvas) {

var Point     = LibCanvas.Point,
	Shapes    = LibCanvas.namespace('Shapes'),
	Rectangle = Shapes.Rectangle,
	Circle    = Shapes.Circle,
	PointFrom = Point.from.context(Point);


var office = {
	all : function (type, style) {
		this.save();
		if (style) this.set(type + 'Style', style);
		this[type + 'Rect'](this.getFullRectangle());
		this.restore();
		return this;
	},
	rect : function (func, args) {
		var rect = office.makeRect.call(this, args);
		return this.original(func,
			[rect.from.x, rect.from.y, rect.width, rect.height]);
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

var canvasProperties = ['width', 'height'].toKeys();

LibCanvas.Context2D = atom.Class({
	initialize : function (canvas) {
		if (canvas instanceof CanvasRenderingContext2D) {
			this.ctx2d  = canvas;
			this.canvas = this.ctx2d.canvas;
		} else {
			this.canvas = canvas;
			this.ctx2d  = canvas.getOriginalContext('2d');
		}
	},
	get width() {
		return this.canvas.width;
	},
	get height() {
		return this.canvas.height;
	},

	_fullRect: null,
	getFullRectangle : function () {
		var fr = this._fullRect;
		if(!fr) {
			this._fullRect = fr = new Rectangle(0, 0, this.width, this.height)
		} else {
			if (fr.width  != this.width ) fr.width  = this.width;
			if (fr.height != this.height) fr.height = this.height;
		}
		return fr;
	},
	original : function (method, args) {
		try {
			this.ctx2d[method].apply(this.ctx2d, args || []);
		} catch (e) {
			atom.log('Error in context2d.original(', method, ',', (args || []), ')');
			throw e;
		}
		return this;
	},
	getClone : function (width, height) {
		width  = width  || canvas.width;
		height = height || canvas.height
		var canvas = this.canvas, clone  = LibCanvas.Buffer(width, height);
		var ctx = clone.getContext('2d');
		!arguments.length ? ctx.drawImage(canvas, 0, 0) :
			ctx.drawImage(canvas, 0, 0, width, height);
		return clone;
	},

	// Values
	set : function (name, value) {
		if (typeof name == 'object') {
			for (var i in name) this.set(i, name[i]);
			return this;
		}
		var object = (name in canvasProperties) ?
			'canvas' : 'ctx2d';
		try {
			this[object][name] = value;
		} catch (e) {
			throw TypeError('Exception while setting «' + name + '» to «' + value + '»: ' + e.message);
		}
		return this;
	},
	get : function (name) {
		return this.ctx2d[name];
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
		arguments.length && this.lineTo.apply(this, arguments);
		return this.original('closePath');
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
	curveTo: function (curve) {
		var p  = Array.from(curve.points || []).map(PointFrom),
			l  = p.length,
			to = Point.from(curve.to);
		if (l == 2) {
			this.original('bezierCurveTo', [
				p[0].x, p[0].y, p[1].x, p[1].y, to.x, to.y
			]);
		} else if (l == 1) {
			this.original('quadraticCurveTo', [
				p[0].x, p[0].y, to.x, to.y
			]);
		} else {
			this.original('lineTo', [to]);
		}
		return this;
	},
	quadraticCurveTo : function () {
		var a = arguments;
		if (a.length == 4) {
			return this.original('bezierCurveTo', arguments);
		} else {
			a = a.length == 2 ? a.associate(['p', 'to']) : a[0];
			return this.curveTo({
				to: a.to,
				points: [a.p]
			});
		}
		// @todo Beauty arguments
		return this.original('quadraticCurveTo', arguments);
	},
	bezierCurveTo : function () {
		var a = arguments;
		if (a.length == 6) {
			return this.original('bezierCurveTo', arguments);
		} else {
			a = a.length == 3 ? a.associate(['p1', 'p2', 'to']) : a[0];
			return this.curveTo({
				to: a.to,
				points: [a.p1, a.p2]
			});
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
	clip : function (shape) {
		if (shape && atom.typeOf(shape.processPath) == 'function') {
			shape.processPath(this);
		}
		return this.original('clip');
	},

	// transformation
	rotate : function (angle, pivot) {
		if (angle) {
			if (pivot) this.translate(pivot);
			this.ctx2d.rotate(angle);
			if (pivot) this.translate(pivot, true);
		}
		return this;
	},
	translate : function (point, reverse) {
		point = Point.from(
			(arguments.length === 1 || typeof reverse === 'boolean')
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
		if (atom.typeOf(cfg.padding) == 'number') {
			cfg.padding = [cfg.padding, cfg.padding];
		}
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
			           to.from.x + (to.width - lineWidth)/2;
		};
		var x, lines = cfg.text.split('\n');
		var measure = function (text) {
			return this.measureText(text).width;
		}.context(this);
		if (cfg.wrap == 'no') {
			lines.forEach(function (line, i) {
				this.fillText(line, xGet(cfg.align == 'left' ? 0 : this.measureText(line).width), to.from.y + (i+1)*lh);
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
						var wordWidth = this.measureText(text).width;
						if (!Lw || Lw + wordWidth < to.width) {
							Lw += wordWidth;
							L  += text;
							continue;
						}
					}
					if (Lw) {
						this.fillText(L, xGet(Lw), to.from.y + (++lNum)*lh + cfg.padding[0]);
						if (last) {
							L  = '';
							Lw = 0;
						} else {
							L  = text;
							Lw = wordWidth;
						}
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

	// @deprecated
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
	// @deprecated
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
					crop.from.x, crop.from.y, crop.width, crop.height,
					draw.from.x, draw.from.y, draw.width, draw.height
				]);
			} else {
				this.original('drawImage', [
					a.image, draw.from.x, draw.from.y, draw.width, draw.height
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
	},
	toString: Function.lambda('[object LibCanvas.Context2D]')
	// Such moz* methods wasn't duplicated:
	// mozTextStyle, mozDrawText, mozMeasureText, mozPathText, mozTextAlongPath

	// is this just properties , that can be used by set ?
	// shadowOffsetX shadowOffsetY shadowBlur shadowColor
});

LibCanvas.Context2D.office = office;

HTMLCanvasElement.addContext('2d-libcanvas', LibCanvas.Context2D);

})(LibCanvas);

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

new function () {

var Keyboard = LibCanvas.Keyboard = atom.Class({
	Implements: [atom.Class.Events],
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
			slash :191, semicolon: 59, apostrophe: 222,

			// Arrows
			aleft:37, aup:38, aright:39, adown:40
		},
		keyStates: {},
		keyState: function (keyName) {
			return this.keyStates[this.keyName(keyName)];
		},
		keyName: function (code) {
			return typeof code == 'string' && code in this.keyCodes ? 
				code : this.key(code);
		},
		key: function (code) {
			if ('keyCode' in code) return this.codeNames[code.keyCode];
			return this[typeof code == 'number' ? 'codeNames' : 'keyCodes'][code] || null;
		}
	},
	initialize : function (libcanvas, preventDefault) {
		this.libcanvas      = libcanvas;
		this.preventDefault = preventDefault;
		
		atom(window).bind({
			keydown:  this.keyEvent('down'),
			keyup:    this.keyEvent('up'),
			keypress: this.keyEvent('press')
		});
	},
	keyEvent: function (event) {
		return function (e) {
			var key = this.self.key(e);
			if (event != 'press') {
				this.self.keyStates[key] = {'down':true, 'up':false}[event] || false;
				if (event == 'down') this.fireEvent(key);
				if (event == 'up')   this.fireEvent(key + ':up');
			} else {
				this.fireEvent(key + ':press');
			}
			var prevent = this.prevent(key);
			if (prevent) e.preventDefault();
			this.debugUpdate();
			return !prevent;
		}.context(this);
	},
	prevent : function (key) {
		var pD = this.preventDefault;
		return pD && (!Array.isArray(pD) || pD.contains(key));
	},
	keyState : function (keyName) {
		return this.self.keyState(keyName);
	},
	debugTrace: null,
	debugUpdate: function () {
		if (this.debugTrace) {
			var keys = '', states = this.self.keyStates;
			for (var key in states) if (states[key]) {
				keys += '\n = ' + key;
			}
			this.debugTrace.trace( 'Keyboard:' + keys );
		}
		return this;
	},
	debug : function (on) {
		this.debugTrace = on === false ? null : new LibCanvas.Utils.Trace();
		this.debugUpdate();
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Keyboard]')
});

Keyboard.extend({ codeNames: Object.invert(Keyboard.keyCodes) });

};


/*
---

name: "Layer"

description: "Layer"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Canvas2D

provides: Layer

...
*/

new function () {
	
var callParent = function (method) {
	return function () {
		this.parentLayer[method].apply(this.parentLayer, arguments);
		return this;
	};
};

LibCanvas.Layer = atom.Class({
	Extends: LibCanvas.Canvas2D,

	Generators: {
		mouse: function () {
			return this.parentLayer.mouse;
		},
		keyboard: function () {
			return this.parentLayer.keyboard;
		},
		invoker: function () {
			return this.parentLayer.invoker;
		},
		wrapper: function () {
			return this.parentLayer.wrapper;
		}
	},
	
	initialize : function (elem, options) {
		this.parentLayer = elem;
		
		this.parent(elem.createBuffer(), options);
	},

	listenMouse : callParent('listenMouse'),
	listenKeyboard :  callParent('listenKeyboard'),

	start : function () {
		throw new Error('Start can be called only from master layer');
	},
	toString: Function.lambda('[object LibCanvas.Layer]')
});

};

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
	- LibCanvas.Behaviours.Drawable

provides: Engines.Tile

...
*/

LibCanvas.namespace('Engines').Tile = atom.Class({
	Implements: [
		LibCanvas.Behaviors.Drawable,
		atom.Class.Events
	],
	tiles : {},
	rects : {},
	first : true,

	cellWidth  : 0,
	cellHeight : 0,
	margin : 0,
	initialize : function (canvas) {
		if (canvas instanceof LibCanvas) {
			this.libcanvas = canvas;
			canvas.freeze();
			canvas = canvas.elem;
		}
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
		return this;
	},
	setMatrix : function (matrix) {
		this.first = true;
		this.checkMatrix(matrix);
		this.matrix    = matrix;
		this.oldMatrix = matrix.clone();
		return this;
	},
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
		this.margin = margin || 0;
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
		if (changed) {
			this.fireEvent('update');
			this.libcanvas && this.libcanvas.showBuffer();
		}
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
		} else if (fn != null) {
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
	},
	draw: function () {
		this.update();
	},
	toString: Function.lambda('[object LibCanvas.Engines.Tile]')
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

new function () {

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

};

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
	},
	toString: Function.lambda('[object LibCanvas.Processors.Clearer]')
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

var math = Math;

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
		return [math.round(hue * 360), math.round(saturation * 100), math.round(brightness * 100)];
	},

	hsbToRgb: function(hue, sat, bri){
		bri = math.round(bri / 100 * 255);
		if (!sat) return [bri, bri, bri];
		hue = hue % 360;
		
		var f = hue % 60,
			p = math.round((bri * (100  - sat)) / 10000 * 255),
			q = math.round((bri * (6000 - sat * f)) / 600000 * 255),
			t = math.round((bri * (6000 - sat * (60 - f))) / 600000 * 255);
		switch (parseInt(hue / 60)){
			case 0: return [bri, t, p];
			case 1: return [q, bri, p];
			case 2: return [p, bri, t];
			case 3: return [p, q, bri];
			case 4: return [t, p, bri];
			case 5: return [bri, p, q];
		}
		return null;
	},
	toString: Function.lambda('[object LibCanvas.Processors.Color]')
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
		// sepia, luminance, average, red, green, blue, default
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
				case 'sepia':
					data[i]   = (r * .393) + (g *.769) + (b * .189);
					data[i+1] = (r * .349) + (g *.686) + (b * .168);
					data[i+2] = (r * .272) + (g *.534) + (b * .131);
					break;
				case 'luminance': set(i, 0.2126*r + 0.7152*g + 0.0722*b); break;
				case 'average'  : set(i, (r + g + b)/3); break;
				case 'red'      : set(i, r); break;
				case 'green'    : set(i, g); break;
				case 'blue'     : set(i, b); break;
				default : set(i, (3*r + 6*g + b) / 10.); break;
			}
		}
		return data;
	},
	toString: Function.lambda('[object LibCanvas.Processors.Grayscale]')
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
	},
	toString: Function.lambda('[object LibCanvas.Processors.HsbShift]')
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
	},
	toString: Function.lambda('[object LibCanvas.Processors.Invert]')
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
	},
	toString: Function.lambda('[object LibCanvas.Processors.Mask]')
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
		this.from.addEvent('move', update);
		this. to .addEvent('move', update);
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
	},
	dump: function () {
		return this.parent('Ellipse');
	},
	toString: Function.lambda('[object LibCanvas.Shapes.Ellipse]')
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

var Point = LibCanvas.Point,
	math = Math,
	max = math.max,
	min = math.min,
	between = function (x, a, b) {
		return x === a || x === b || (a < x && x < b) || (b < x && x < a);
	};


LibCanvas.namespace('Shapes').Line = atom.Class({
	Extends: LibCanvas.Shape,
	set : function (from, to) {
		var a = Array.pickFrom(arguments);

		this.from = Point.from(a[0] || a.from);
		this.to   = Point.from(a[1] || a.to);
		
		return this;
	},
	hasPoint : function (point) {
		var fx = this.from.x,
			fy = this.from.y,
			tx = this.to.x,
			ty = this.to.y,
			px = this.point.x,
			py = this.point.y;

		if (!( px.between(min(fx, tx), max(fx, tx))
		    && py.between(min(fy, ty), max(fy, ty))
		)) return false;

		// if triangle square is zero - points are on one line
		return ((fx-px)*(ty-py)-(tx-px)*(fy-py)).round(6) == 0;
	},
	intersect: function (line, point) {
		line = this.self.from(line);
		var a = this.from, b = this.to, c = line.from, d = line.to, x, y, FALSE = point ? null : false;
		if (d.x == c.x) { // DC == vertical line
			if (b.x == a.x) {
				if (a.x == d.x) {
					if (a.y.between(c.y, d.y)) {
						return a.clone();
					} else if (b.y.between(c.y, d.y)) {
						return b.clone();
					} else {
						return FALSE;
					}
				} else {
					return FALSE;
				}
			}
			x = d.x;
			y = b.y + (x-b.x)*(a.y-b.y)/(a.x-b.x);
		} else {
			x = ((a.x*b.y - b.x*a.y)*(d.x-c.x)-(c.x*d.y - d.x*c.y)*(b.x-a.x))/((a.y-b.y)*(d.x-c.x)-(c.y-d.y)*(b.x-a.x));
			y = ((c.y-d.y)*x-(c.x*d.y-d.x*c.y))/(d.x-c.x);
			x *= -1;
		}
		
		return between(x, a.x, b.x) && between (y, a.y, b.y) &&
		       between(x, c.x, d.x) && between (y, c.y, d.y) ?
		            (point ? new Point(x, y) : true) : FALSE;
	},
	get length () {
		return this.to.distanceTo(this.from);
	},
	getLength : function () {
		return this.length;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		ctx.moveTo(this.from).lineTo(this.to);
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	dump: function () {
		return this.parent('Line');
	},
	toString: Function.lambda('[object LibCanvas.Shapes.Line]')
});

};


/*
---

name: "Shapes.Path"

description: "Provides Path as canvas object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Path

...
*/

(function (LibCanvas) {

var Point = LibCanvas.Point, Shapes = LibCanvas.Shapes;

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
	},
	toString: Function.lambda('[object LibCanvas.Shapes.Path]')
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

})(LibCanvas);

/*
---

name: "Ui.Shaper"

description: "Provides base ui object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Drawable
	- Behaviors.Clickable
	- Behaviors.Draggable
	- Behaviors.Droppable
	- Behaviors.Linkable
	- Behaviors.MouseListener
	- Behaviors.Moveable

provides: Ui.Shaper

...
*/


new function () {

var Beh = LibCanvas.Behaviors,
	Sh  = LibCanvas.Shapes;

LibCanvas.namespace('Ui').Shaper = atom.Class({
	Extends: atom.Class.Options,
	Implements: [
		Beh.Drawable,
		Beh.Animatable,
		Beh.Clickable,
		Beh.Draggable,
		Beh.Droppable,
		Beh.Linkable,
		Beh.MouseListener,
		Beh.Moveable
	],

	options : {},
	initialize : function (libcanvas, options) {
		this.update = libcanvas.update;

		this.setOptions(options);
		this.setShape(options.shape);

		this.getShape().addEvent('move', libcanvas.update);
		this.addEvent(['moveDrag', 'statusChanged'], libcanvas.update);
	},
	setOptions : function (options) {
		this.update();
		return this.parent(options);
	},
	getStyle : function (type) {
		var o = this.options;
		return (this.active && o.active) ? o.active[type] :
		       (this.hover  && o.hover)  ? o.hover [type] :
		                      (o[type]  || null);
	},

	drawTo : function (ctx) {
		var fill    = this.getStyle('fill'),
			stroke  = this.getStyle('stroke'),
			lineW   = this.getStyle('lineWidth'),
			opacity = this.getStyle('opacity');

		ctx.save();
		if (lineW  ) ctx.set('lineWidth', lineW);
		if (opacity) ctx.set('globalOpacity', opacity);
		if (fill   ) ctx.fill  (this.getShape(), fill  );
		if (stroke ) ctx.stroke(this.getShape(), stroke);
		ctx.restore();
		return this;
	},
	draw : function () {
		return this.drawTo(this.libcanvas.ctx);
	},

	// accessors


	get fill () {
		return this.options.fill;
	},
	set fill (value) {
		this.options.fill = value;
		this.update();
	},

	get stroke () {
		return this.options.stroke;
	},
	set stroke (value) {
		this.options.stroke = value;
		this.update();
	},

	get lineWidth () {
		return this.options.lineWidth;
	},
	set lineWidth (value) {
		this.options.lineWidth = value;
		this.update();
	},

	get radius () {
		if (!Sh.Circle.isInstance(this.shape)) {
			throw new TypeError('Shape is not circle');
		}
		return this.shape.radius;
	},
	set radius (value) {
		if (!Sh.Circle.isInstance(this.shape)) {
			throw new TypeError('Shape is not circle');
		}
		this.shape.radius = value;
		this.update();
	},
	dump: function () {
		return '[Shaper ' + this.shape.dump() + ']';
	},
	toString: Function.lambda('[object LibCanvas.Ui.Shaper]')
});

};

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
	},
	toString: Function.lambda('[object LibCanvas.Utils.AudioContainer]')
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
		var gatling = file.match(/:(\d+)$/);
		if (gatling) {
			file = file.replace(/:\d+$/, '');
			gatling = gatling[1];
		}
		this.audio.src = file.replace(/\*/g, this.getExtension());
		this.audio.load();
		if (gatling) this.gatling(gatling);
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
	play : function (elem) {
		if (this.stub) return this;
		(elem || this.getCurrent()).play();
		return this;
	},
	pause : function (elem) {
		if (this.stub) return this;
		(elem || this.getCurrent()).pause();
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
	restart: function (elem) {
		elem = elem || this.getCurrent();
		elem.currentTime = 0.025;
		if (elem.ended || elem.paused) {
			elem.play();
		}
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
		this.getNext();
		this.restart();
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
	},
	toString: Function.lambda('[object LibCanvas.Utils.AudioElement]')
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

(function (LibCanvas) {

var Point     = LibCanvas.Point,
	Buffer    = LibCanvas.Buffer,
	Rectangle = LibCanvas.Shapes.Rectangle,
	math      = Math,
	ImgProto  = HTMLImageElement.prototype;

// <image> tag
atom.implement(HTMLImageElement, {
	// наверное, лучше использовать createPattern
	createSprite: function (rect) {
		if (rect.width <= 0 || rect.height <= 0) {
			throw new TypeError('Wrong rectangle size');
		}

		var buf = new Buffer(rect.width, rect.height, true),
			xShift, yShift, x, y, xMax, yMax, crop, size;

		// если координаты выходят за левый/верхний край картинки
		{
			if (rect.from.x < 0) xShift = (rect.from.x.abs() / rect.width ).ceil();
			if (rect.from.y < 0) yShift = (rect.from.y.abs() / rect.height).ceil();
			if (xShift || yShift) {
				rect = rect.clone().move({
					x: xShift * this.width,
					y: yShift * this.height
				});
			}
		}

		// для того, чтобы была возможность указывать ректангл, выходящий
		// за пределы картинки. текущая картинка повторяется как паттерн
		xMax = (rect.to.x / this.width ).ceil();
		yMax = (rect.to.y / this.height).ceil();
		for (y = yMax; y-- > 0;) for (x = xMax; x-- > 0;) {
			var current = new Point(x * this.width, y * this.height);
			var from = current.clone();
			var to   = from.clone().move([this.width, this.height]);

			if (from.x < rect.from.x) from.x = rect.from.x;
			if (from.y < rect.from.y) from.y = rect.from.y;
			if (  to.x > rect. to .x)   to.x = rect. to .x;
			if (  to.y > rect. to .y)   to.y = rect. to .y;
			
			crop = new Rectangle(from, to);
			size = crop.size;
			crop.from.x %= this.width;
			crop.from.y %= this.height;
			crop.size    = size;

			if (x) current.x -= rect.from.x;
			if (y) current.y -= rect.from.y;
			
			buf.ctx.drawImage({
				image : this,
				crop  : crop,
				draw  : new Rectangle({
					from: current,
					size: size
				})
			});
		}

		return buf;
	},
	toCanvas: function () {
		var cache = (this.spriteCache = (this.spriteCache || {}));
		if (!cache[0]) {
			cache[0] = Buffer(this, true)
				.ctx.drawImage(this)
				.canvas;
		}
		return cache[0];
	},
	sprite : function () {
		if (!this.isLoaded()) throw new Error('Not loaded in Image.sprite, logged');

		if (arguments.length) {
			var rect  = Rectangle.from(arguments),
				index = [rect.from.x,rect.from.y,rect.width,rect.height].join('.'),
				cache = (this.spriteCache = (this.spriteCache || {}));
			if (!cache[index]) cache[index] = this.createSprite(rect);
			return cache[index];
		} else {
			return this.toCanvas();
		}
	},
	isLoaded : function () {
		if (!this.complete)  return false;
		return this.naturalWidth == null || this.naturalWidth;
	}
});
	// mixin from image
atom.implement(HTMLCanvasElement, {
	createSprite : ImgProto.createSprite,
	sprite   : ImgProto.sprite,
	isLoaded : function () { return true; },
	toCanvas : function () { return this; }
});
	
})(LibCanvas);

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

LibCanvas.namespace('Utils').StopWatch = atom.Class({
	startTime : 0,
	time      : 0,
	traceElem : null,
	initialize : function (autoStart) {
		autoStart && this.start();
	},
	start : function () {
		this.startTime = Date.now();
		return this;
	},
	stop : function () {
		this.startTime = 0;
		this.time      = 0;
		return this;
	},
	getTime : function (micro) {
		var d2 = function (num) { return num < 10 ? '0' + num : num; };

		var t = this.time + (Date.now() - this.startTime);

		if (micro) return t;
		var s = (t / 1000).round();
		var m = (s / 60).round();
		var h = (m / 60).round();
		return (s < 60) ?
			d2((t / 1000).toFixed(1)) :
			h + ':' + d2(m) + ':' + d2(s % 60);
	},
	toString: Function.lambda('[object LibCanvas.Utils.StopWatch]')
});

/*
---

name: "Utils.Storage"

description: "Storage"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Utils.Storage

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
	},
	toString: Function.lambda('[object LibCanvas.Utils.Storage]')
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
	},
	toString: Function.lambda('[object LibCanvas.Utils.TimeLogger]')
});

}();

/*
---

name: "Utils.Translator"

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
	},
	toString: Function.lambda('[object LibCanvas.Utils.Translator]')

});

}();
 
