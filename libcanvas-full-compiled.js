
/*
---

name: "LibCanvas"

description: "LibCanvas - free javascript library, based on AtomJS framework."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

...
*/

(function (atom, Math) { // LibCanvas

// bug in Safari 5.1 ( 'use strict' + 'set prop' )
// 'use strict';

var undefined,
	/** @global {Object} global */
	global   = this,
	/** @global {Function} slice */
	slice    = [].slice,
	/** @global {Function} declare  */
	declare  = atom.declare,
	/** @global {Function} Registry  */
	Registry = atom.Registry,
	/** @global {Function} Events  */
	Events   = atom.Events,
	/** @global {Function} Settings  */
	Settings = atom.Settings;
/*
---

name: "LibCanvas"

description: "LibCanvas initialization"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: LibCanvas

...
*/

var LibCanvas = this.LibCanvas = declare({ name: 'LibCanvas', prototype: {} })
	.own({
		Buffer: function () {
			return LibCanvas.buffer.apply( LibCanvas, arguments );
		},
		buffer: function (width, height, withCtx) {
			var canvas, size, a = slice.call(arguments), last = a[a.length-1];

			withCtx = (typeof last === 'boolean' ? a.pop() : false);

			size = Size(a.length == 1 ? a[0] : a);
			
			canvas = atom.dom.create("canvas", {
				width  : size.width,
				height : size.height
			}).first;
			
			if (withCtx) canvas.ctx = new Context2D(canvas);
			return canvas;
		},
		'declare.classes': {},
		declare: function (declareName, shortName, Parent, object) {
			if (typeof shortName == 'object') {
				object = Parent;
				Parent = shortName;
				shortName = null;
			}
			if (object == null) {
				object = Parent;
				Parent = null;
			}
			var Class = declare( declareName, Parent, object );
			if (shortName) {
				if (shortName in this['declare.classes']) {
					throw new Error( 'Duplicate declaration: ' + shortName );
				}
				this['declare.classes'][shortName] = Class;
			}
			return Class;
		},
		extract: function (to) {
			to = to || global;
			for (var k in this['declare.classes']) {
				to[k] = this['declare.classes'][k];
			}
			return to;
		}
	});

/*
---

name: "App"

description: "LibCanvas.App"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: App

...
*/

/** @class App */
LibCanvas.declare( 'LibCanvas.App', 'App', {
	initialize: function (settings) {
		this.bindMethods( 'tick' );

		this.scenes    = [];
		this.settings  = new Settings({ appendTo: 'body' }).set(settings);
		this.container = new App.Container(
			this.settings.get(['size', 'appendTo'])
		);
		this.resources = new Registry();

		atom.frame.add( this.tick );
	},

	get rectangle () {
		return this.container.rectangle;
	},

	/**
	 * return "-1" if left is higher, "+1" if right is higher & 0 is they are equals
	 * @param {App.Element} left
	 * @param {App.Element} right
	 * @returns {number}
	 */
	zIndexCompare: function (left, right, inverted) {
		var leftZ, rightZ, factor = inverted ? -1 : +1;

		if (!left  || !left.scene ) throw new TypeError( 'Wrong left element'  );
		if (!right || !right.scene) throw new TypeError( 'Wrong right element' );


		 leftZ =  left.scene.layer.zIndex;
		rightZ = right.scene.layer.zIndex;

		if (leftZ > rightZ) return -1 * factor;
		if (leftZ < rightZ) return +1 * factor;

		 leftZ =  left.zIndex;
		rightZ = right.zIndex;

		if (leftZ > rightZ) return -1 * factor;
		if (leftZ < rightZ) return +1 * factor;

		return 0;
	},

	createScene: function (settings) {
		var scene = new App.Scene(this, settings);
		this.scenes.push(scene);
		return scene;
	},

	tick: function (time) {
		atom.array.invoke(this.scenes, 'tick', time);
	}
});

var App = LibCanvas.App;

/*
---

name: "App.Container"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.Container

...
*/

/**
 * @class App.Container
 * @private */
declare( 'LibCanvas.App.Container', {
	/** @private
	 *  @property {Size} */
	currentSize: null,

	/** @property {App.Layer[]} */
	layers: [],

	initialize: function (settings) {
		this.layers      = [];
		this.settings    = new Settings(settings);
		this.currentSize = new Size(this.settings.get('size') || [0,0]);
		this.createWrappers();
	},

	get rectangle () {
		var size = this.size;
		return new Rectangle(0, 0, size.width, size.height);
	},

	set size(size) {
		size = this.currentSize.set(size).toObject();

		this.wrapper.css(size);
		this.bounds .css(size);
	},

	get size() {
		return this.currentSize;
	},

	createLayer: function (settings) {
		var layer = new App.Layer( this, settings );
		this.layers.push(layer);
		return layer;
	},

	appendTo: function (element) {
		if (element) this.wrapper.appendTo( element );
		return this;
	},

	/** @private */
	createWrappers: function () {
		this.bounds = atom.dom.create('div').css({
			overflow: 'hidden',
			position: 'absolute'
		})
		.css(this.currentSize.toObject());
		
		this.wrapper = atom.dom.create('div')
			.css(this.currentSize.toObject())
			.addClass('libcanvas-layers-container');

		this.bounds .appendTo(this.wrapper);
		this.wrapper.appendTo(this.settings.get( 'appendTo' ));
	}
});

/*
---

name: "App.Dragger"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.Dragger

...
*/
/** @class App.Dragger */
declare( 'LibCanvas.App.Dragger', {
	initialize: function (mouse) {
		this.bindMethods([ 'dragStart', 'dragStop', 'dragMove' ]);
		this.events = new Events(this);

		this.mouse  = mouse;
		this.shifts = [];

		this._events = {
			down: this.dragStart,
			up  : this.dragStop,
			out : this.dragStop,
			move: this.dragMove
		};
	},

	addSceneShift: function (shift) {
		this.shifts.push( shift );
		return this;
	},

	started: false,

	start: function (callback) {
		if (callback !== undefined) {
			this.callback = callback;
		}
		this.started = true;
		this.mouse.events.add( this._events );
		return this;
	},

	stop: function () {
		this.started = false;
		this.mouse.events.remove( this._events );
		return this;
	},

	/** @private */
	dragStart: function (e) {
		if (!this.shouldStartDrag(e)) return;

		for (var i = this.shifts.length; i--;) {
			this.shifts[i].scene.stop();
		}
		this.drag = true;
		this.events.fire( 'start', [ e ]);
	},
	/** @private */
	dragStop: function (e) {
		if (!this.drag) return;

		for (var i = this.shifts.length; i--;) {
			var shift = this.shifts[i];
			shift.addElementsShift();
			shift.scene.start();
		}

		this.drag = false;
		this.events.fire( 'stop', [ e ]);
	},
	/** @private */
	dragMove: function (e) {
		if (!this.drag) return;
		for (var i = this.shifts.length; i--;) {
			this.shifts[i].addShift(this.mouse.delta);
		}
	},
	/** @private */
	shouldStartDrag: function (e) {
		if (!this.started) return false;

		return this.callback ? this.callback(e) : true;
	}
});

/*
---

name: "App.Element"

description: "LibCanvas.Scene"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.Element

...
*/

/** @class App.Element */
declare( 'LibCanvas.App.Element', {

	zIndex  : 0,
	renderer: null,
	settings: {},

	/** @constructs */
	initialize: function (scene, settings) {
		this.bindMethods([ 'redraw', 'destroy' ]);

		this.events = new Events(this);
		this.settings = new Settings({ hidden: false })
			.set(this.settings)
			.set(settings)
			.addEvents(this.events);
		scene.addElement( this );

		var ownShape = this.shape && this.shape != this.constructor.prototype.shape;

		if (ownShape || this.settings.get('shape')) {
			if (!ownShape) this.shape = this.settings.get('shape');
			this.saveCurrentBoundingShape();
		}
		if (this.settings.get('zIndex') != null) {
			this.zIndex = Number( this.settings.get('zIndex') );
		}

		this.configure();
	},

	configure: function () {
		return this;
	},

	previousBoundingShape: null,

	get currentBoundingShape () {
		return this.shape.getBoundingRectangle().fillToPixel();
	},

	destroy: function () {
		this.scene.rmElement( this );
		return this;
	},

	hasPoint: function (point) {
		return this.shape.hasPoint( point );
	},

	hasMousePoint: function (point) {
		return this.hasPoint(point);
	},

	addShift: function (shift) {
		this.shape.move( shift );
		this.previousBoundingShape.move( shift );
		return this;
	},

	isVisible: function () {
		return !this.settings.get('hidden');
	},

	redraw: function () {
		this.scene.redrawElement( this );
		return this;
	},

	onUpdate: function (time) {
		return this;
	},

	clearPrevious: function ( ctx ) {
		if (this.previousBoundingShape) ctx.clear( this.previousBoundingShape );
		return this;
	},

	saveCurrentBoundingShape: function () {
		var shape = this.currentBoundingShape;
		this.previousBoundingShape = shape.fillToPixel ?
			shape.clone().fillToPixel() : shape.clone().grow( 2 );
		return this;
	},

	renderTo: function (ctx, resources) {
		if (this.renderer) {
			this.renderer.renderTo(ctx, resources);
		}
		return this;
	}
});

/*
---

name: "App.ElementsMouseSearch"

description: "LibCanvas.App.ElementsMouseSearch"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.ElementsMouseSearch

...
*/

/** @class App.ElementsMouseSearch */
declare( 'LibCanvas.App.ElementsMouseSearch', {

	initialize: function () {
		this.elements = [];
	},

	add: function (elem) {
		this.elements.push( elem );
		return this;
	},

	remove: function (elem) {
		atom.core.eraseOne( this.elements, elem );
		return this;
	},

	findByPoint: function (point) {
		var e = this.elements, i = e.length, result = [];
		while (i--) if (e[i].hasMousePoint( point )) {
			result.push(e[i]);
		}
		return result;
	}

});

/*
---

name: "App.Layer"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.Layer

...
*/


/** @class App.Layer */
declare( 'LibCanvas.App.Layer', {
	/** @private
	 *  @property {Size} */
	currentSize: null,
	
	/** @private
	 *  @property {App.Container} */
	container: null,

	/** @private
	 *  @property {Point} */
	shift: null,

	/** @private */
	z: 0,

	initialize: function (container, settings) {
		this.container = container;
		this.settings  = new Settings(settings);
		this.shift = new Point(0,0);
		this.name  = this.settings.get('name') || '';
		this.createSize();
		this.createElement();
		this.zIndex = this.settings.get('zIndex') || 0;
	},

	set zIndex (z) {
		this.z = z;
		this.element.css('zIndex', z);
	},

	get zIndex () {
		return this.z;
	},

	set size(size) {
		size = this.currentSize.set(size);

		this.canvas.width  = size.width ;
		this.canvas.height = size.height;
	},

	get size() {
		return this.currentSize;
	},

	/**
	 * @param {Point} shift
	 * @returns {App.Layer}
	 */
	addShift: function ( shift ) {
		shift = Point( shift );
		var newShift = this.shift.move( shift );
		this.element.css({
			marginLeft: newShift.x,
			marginTop : newShift.y
		});
		return this;
	},

	/**
	 * @param {Point} shift
	 * @returns {App.Layer}
	 */
	setShift: function (shift) {
		return this.addShift( this.shift.diff(shift) );
	},

	/** @returns {Point} */
	getShift: function () {
		return this.shift;
	},

	/** @private */
	createSize: function () {
		this.currentSize = this.settings.get('size') || this.container.size.clone();
	},

	/** @private */
	createElement: function () {
		this.canvas  = new LibCanvas.Buffer(this.size, true);
		this.element = atom.dom(this.canvas)
			.attr({ 'data-name': this.name  })
			.css ({ 'position' : 'absolute' })
			.appendTo( this.container.bounds );
	}
});

/*
---

name: "App.MouseHandler"

description: "LibCanvas.App.MouseHandler"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.MouseHandler

...
*/

/** @class App.MouseHandler */
declare( 'LibCanvas.App.MouseHandler', {

	events: [ 'down', 'up', 'move', 'out', 'dblclick', 'contextmenu', 'wheel' ],

	/** @private */
	mouse: null,

	/** @constructs */
	initialize: function (settings) {
		var handler = this;

		handler.settings = new Settings(settings);
		handler.lastMouseMove = [];
		handler.lastMouseDown = [];
		handler.subscribers   = [];

		handler.app    = handler.settings.get('app');
		handler.mouse  = handler.settings.get('mouse');
		handler.compareFunction = function (left, right) {
			return handler.app.zIndexCompare(left, right, true);
		};
		handler.search =
			handler.settings.get('search') ||
			new App.ElementsMouseSearch(handler.subscribers);


		this.events.forEach(function (type) {
			handler.mouse.events.add( type, function (e) {
				handler.event(type, e);
			});
		});
	},

	stop: function () {
		this.stopped = true;
		return this;
	},

	start: function () {
		this.stopped = false;
		return this;
	},

	subscribe : function (elem) {
		if (this.subscribers.indexOf(elem) == -1) {
			this.subscribers.push(elem);
			this.search.add(elem);
		}
		return this;
	},

	unsubscribe : function (elem) {
		var index = this.subscribers.indexOf(elem);
		if (index != -1) {
			this.subscribers.splice(index, 1);
			this.search.remove(elem);
		}
		return this;
	},

	fall: function () {
		var value = this.falling;
		this.falling = false;
		return value;
	},

	getOverElements: function () {
		if (!this.mouse.inside) return [];

		var elements = this.search.findByPoint( this.mouse.point );

		try {
			return elements.sort( this.compareFunction );
		} catch (e) {
			throw new Error('Element binded to mouse, but without scene, check elements');
		}
	},

	/** @private */
	stopped: false,

	/** @private */
	falling: false,

	/** @private */
	checkFalling: function () {
		var value = this.falling;
		this.falling = false;
		return value;
	},

	/** @private */
	event: function (type, e) {
		if (this.stopped) return;

		var method = ['dblclick', 'contextmenu', 'wheel'].indexOf( type ) >= 0
			? 'forceEvent' : 'parseEvent';
		
		return this[method]( type, e );
	},

	/** @private */
	parseEvent: function (type, event) {
		if (type == 'down') this.lastMouseDown.length = 0;

		var i, elem,
			elements = this.getOverElements(),
			stopped  = false,
			eventArgs = [event],
			isChangeCoordEvent = (type == 'move' || type == 'out');

		// В первую очередь - обрабатываем реальный mouseout с элементов
		if (isChangeCoordEvent) {
			this.informOut(eventArgs, elements);
		}

		for (i = elements.length; i--;) {
			elem = elements[i];
			// мышь над элементом, сообщаем о mousemove
			// о mouseover, mousedown, click, если необходимо
			if (!stopped) {
				if (this.fireElem( type, elem, eventArgs )) {
					if (!isChangeCoordEvent) break;
				}
			// предыдущий элемент принял событие на себя
			// необходимо сообщить остальным элементам под ним о mouseout
			// Но только если это событие передвижения или выхода за границы холста
			// а не активационные, как маусдаун или маусап
			} else {
				this.stoppedElem(elem, eventArgs);
			}
		}

		return stopped;
	},

	/** @private */
	informOut: function (eventArgs, elements) {
		var
			elem,
			lastMove = this.lastMouseMove,
			i = lastMove.length;
		while (i--) {
			elem = lastMove[i];
			if (elements.indexOf(elem) < 0) {
				elem.events.fire( 'mouseout', eventArgs );
				lastMove.splice(i, 1);
			}
		}
	},

	/** @private */
	stoppedElem: function (elem, eventArgs) {
		var
			lastMove = this.lastMouseMove,
			index    = lastMove.indexOf(elem);
		if (index > -1) {
			elem.events.fire( 'mouseout', eventArgs );
			lastMove.splice(index, 1);
		}
	},

	/** @private */
	fireElem: function (type, elem, eventArgs) {
		var
			lastDown = this.lastMouseDown,
			lastMove = this.lastMouseMove;

		if (type == 'move') {
			if (lastMove.indexOf(elem) < 0) {
				elem.events.fire( 'mouseover', eventArgs );
				lastMove.push( elem );
			}
		} else if (type == 'down') {
			lastDown.push(elem);
		// If mouseup on this elem and last mousedown was on this elem - click
		} else if (type == 'up' && lastDown.indexOf(elem) > -1) {
			elem.events.fire( 'click', eventArgs );
		}
		elem.events.fire( 'mouse' + type, eventArgs );

		return !this.checkFalling();
	},

	/** @private */
	forceEvent: function (type, event) {
		var
			elements = this.getOverElements(),
			i = elements.length;
		while (i--) {
			elements[i].events.fire( type, [ event ]);
			if (!this.checkFalling()) {
				break;
			}
		}
	}

});

/*
---

name: "App.Scene"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.Scene

...
*/

/** @class App.Scene */
declare( 'LibCanvas.App.Scene', {

	initialize: function (app, settings) {
		this.settings = new Settings({
			invoke      : app.settings.get('invoke'),
			intersection: 'auto' // auto|manual|all
		}).set(settings);

		this.shouldRedrawAll = this.settings.get('intersection') === 'all';

		this.app      = app;
		this.elements = [];
		this.redraw   = this.shouldRedrawAll ? this.elements : [];
		this.clear    = [];
		this.createLayer();
	},

	get ctx () {
		return this.layer.canvas.ctx;
	},

	/** @private */
	stopped: false,

	start: function () {
		this.stopped = false;
		return this;
	},

	stop: function () {
		this.stopped = true;
		return this;
	},

	/** @private */
	shouldRedrawAll: false,

	/** @private */
	tick: function (time) {
		if (this.stopped) return this;

		if (this.settings.get( 'invoke' )) {
			this.sortElements();
			this.updateAll(time);
		}

		if (this.needUpdate) {
			this.draw();
			this.needUpdate = false;
		}

		return this;
	},


	/** @private */
	draw: function () {
		var i, elem,
			ctx = this.layer.canvas.ctx,
			redraw = this.redraw,
			clear  = this.clear,
			resources = this.app.resources;

		if (this.settings.get('intersection') === 'auto') {
			this.addIntersections();
		}

		// draw elements with the lower zIndex first
		atom.array.sortBy( redraw, 'zIndex' );

		if (this.shouldRedrawAll) {
			for (i = clear.length; i--;) {
				clear[i].clearPrevious( ctx, resources );
			}
		}

		for (i = redraw.length; i--;) {
			redraw[i].clearPrevious( ctx, resources );
		}

		for (i = redraw.length; i--;) {
			elem = redraw[i];
			if (elem.scene == this) {
				elem.redrawRequested = false;
				if (elem.isVisible()) {
					elem.renderTo( ctx, resources );
					elem.saveCurrentBoundingShape();
				}
			}
		}

		if (!this.shouldRedrawAll) {
			redraw.length = 0;
		}
	},

	/** @private */
	sortElements: function () {
		atom.array.sortBy( this.elements, 'zIndex' );
	},

	/** @private */
	updateAll: function (time) {
		atom.array.invoke( this.elements, 'onUpdate', time, this.app.resources );
	},

	/** @private */
	needUpdate: false,

	/** @private */
	createLayer: function () {
		this.layer = this.app.container.createLayer(
			this.settings.get([ 'name', 'zIndex' ])
		);
	},

	/** @private */
	addElement: function (element) {
		if (element.scene != this) {
			element.scene = this;
			this.elements.push( element );
			this.redrawElement( element );
		}
		return this;
	},

	/** @private */
	rmElement: function (element) {
		if (element.scene == this) {
			if (this.shouldRedrawAll) {
				this.needUpdate = true;
				this.clear.push(element);
			} else {
				this.redrawElement( element );
			}
			atom.array.erase( this.elements, element );
			element.scene = null;
		}
		return this;
	},

	/** @private */
	redrawElement: function (element) {
		if (element.scene == this && !element.redrawRequested) {
			this.needUpdate = true;
			element.redrawRequested = true;
			if (!this.shouldRedrawAll) {
				this.redraw.push( element );
			}
		}
		return this;
	},

	/** @private */
	addIntersections: function () {
		var i, elem, scene  = this;

		for (i = 0; i < this.redraw.length; i++) {
			elem = this.redraw[i];

			this.findIntersections(elem.previousBoundingShape, elem, this.redrawElement);
			this.findIntersections(elem. currentBoundingShape, elem, function (e) {
				// we need to redraw it, only if it will be over our element
				if (e.zIndex > elem.zIndex) {
					scene.redrawElement( e );
				}
			});
		}
	},

	/** @private */
	findIntersections: function (shape, elem, fn) {
		if (!shape) return;

		var i = this.elements.length, e;
		while (i--) {
			e = this.elements[i];
			// check if we need also `e.currentBoundingShape.intersect( shape )`
			if (e != elem && e.isVisible() &&
				e.previousBoundingShape &&
				e.previousBoundingShape.intersect( shape )
			) fn.call( this, e );
		}
	}

});

/*
---

name: "App.SceneShift"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.SceneShift

...
*/

/** @class App.SceneShift */
declare( 'LibCanvas.App.SceneShift', {

	initialize: function (scene) {
		this.scene    = scene;
		this.shift    = new Point(0, 0);
		this.elementsShift = new Point(0, 0);
	},

	/**
	 * @private
	 * @property {Point}
	 */
	shift: null,

	/**
	 * @private
	 * @property {Point}
	 */
	elementsShift: null,

	/**
	 * @param {Point} shift
	 */
	addElementsShift: function (shift) {
		if (!shift) {
			shift = this.elementsShift.diff(this.shift);
		} else {
			shift = Point(shift);
		}
		var e = this.scene.elements, i = e.length;
		while (i--) e[i].addShift(shift);
		this.elementsShift.move(shift);
		return this;
	},

	/**
	 * @private
	 * @property {LibCanvas.Shapes.Rectangle}
	 */
	limitShift: null,

	/**
	 * @param {Rectangle} limitShift
	 */
	setLimitShift: function (limitShift) {
		this.limitShift = limitShift ? Rectangle(limitShift) : null;
		return this;
	},

	/**
	 * @param {Point} shift
	 */
	addShift: function ( shift, withElements ) {
		shift = new Point( shift );

		var limit = this.limitShift, current = this.shift;
		if (limit) {
			shift.x = atom.number.limit(shift.x, limit.from.x - current.x, limit.to.x - current.x);
			shift.y = atom.number.limit(shift.y, limit.from.y - current.y, limit.to.y - current.y);
		}

		current.move( shift );
		this.scene.layer.addShift( shift );
		this.scene.layer.canvas.ctx.translate( shift, true );
		if (withElements) this.addElementsShift( shift );
		return this;
	},

	/**
	 * @param {Point} shift
	 */
	setShift: function (shift, withElements) {
		return this.addShift( this.shift.diff(shift), withElements );
	},

	/**
	 * @returns {Point}
	 */
	getShift: function () {
		return this.shift;
	}
});

/*
---

name: "Behaviors"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Behaviors

...
*/

/** @class Behaviors */
var Behaviors = LibCanvas.declare( 'LibCanvas.Behaviors', 'Behaviors', {
	initialize: function (element) {
		this.element   = element;
		this.behaviors = {};
	},

	add: function (Behaviour, args) {
		if (typeof Behaviour == 'string') {
			Behaviour = this.constructor[Behaviour];
		}

		return this.behaviors[Behaviour.index] = new Behaviour(this, slice.call( arguments, 1 ));
	},

	get: function (name) {
		return this.behaviors[name] || null;
	}
});


var Behavior = declare( 'LibCanvas.Behaviors.Behavior', {
	started: false,

	/** @private */
	eventArgs: function (args, eventName) {
		if (atom.core.isFunction(args[0])) {
			this.events.add( eventName, args[0] );
		}
	},

	/** @private */
	changeStatus: function (status){
		if (this.started == status) {
			return false;
		} else {
			this.started = status;
			return true;
		}
	}
});

/*
---

name: "Behaviors.Clickable"

description: "Provides interface for clickable canvas objects"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors

provides: Behaviors.Clickable

...
*/

new function () {

function setValueFn (name, val) {
	var result = [name, val];
	return function () {
		if (this[name] != val) {
			this[name] = val;
			this.events.fire('statusChange', result);
		}
	};
}

return declare( 'LibCanvas.Behaviors.Clickable', Behavior, {

	callbacks: {
		'mouseover'   : setValueFn('hover' , true ),
		'mouseout'    : setValueFn('hover' , false),
		'mousedown'   : setValueFn('active', true ),
		'mouseup'     : setValueFn('active', false),
		'away:mouseup': setValueFn('active', false)
	},

	initialize: function (behaviors, args) {
		this.events = behaviors.element.events;
		this.eventArgs(args, 'statusChange');
	},

	start: function () {
		if (!this.changeStatus(true)) return this;

		this.eventArgs(arguments, 'statusChange');
		this.events.add(this.callbacks);
	},

	stop: function () {
		if (!this.changeStatus(false)) return this;

		this.events.remove(this.callbacks);
	}

}).own({ index: 'clickable' });

};

/*
---

name: "Behaviors.Draggable"

description: "When object implements LibCanvas.Behaviors.Draggable interface dragging made possible"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors

provides: Behaviors.Draggable

...
*/

declare( 'LibCanvas.Behaviors.Draggable', Behavior, {
	stopDrag: [ 'up', 'out' ],

	initialize: function (behaviors, args) {
		this.bindMethods([ 'onStop', 'onDrag', 'onStart' ]);

		this.element = behaviors.element;
		if (!atom.core.isFunction(this.element.move)) {
			throw new TypeError( 'Element ' + this.element + ' must has «move» method' );
		}
		this.events  = behaviors.element.events;
		this.eventArgs(args, 'moveDrag');
	},

	bindMouse: function (method) {
		var mouse = this.element.mouse, stop = this.stopDrag;
		if (!mouse) throw new Error('No mouse in element');

		mouse.events
			[method]( 'move', this.onDrag )
			[method](  stop , this.onStop );

		return mouse;
	},

	start: function () {
		if (!this.changeStatus(true)) return this;

		this.eventArgs(arguments, 'moveDrag');
		this.events.add( 'mousedown', this.onStart );
	},

	stop: function () {
		if (!this.changeStatus(false)) return this;

		this.events.remove( 'mousedown', this.onStart );
	},

	/** @private */
	onStart: function (e) {
		if (e.button !== 0) return;

		this.bindMouse('add');
		this.events.fire('startDrag', [ e ]);
	},

	/** @private */
	onDrag: function (e) {
		var delta = this.element.mouse.delta;
		this.element.move( delta );
		this.events.fire('moveDrag', [delta, e]);
	},

	/** @private */
	onStop: function (e) {
		if (e.button !== 0) return;
		this.bindMouse('remove');
		this.events.fire('stopDrag', [ e ]);
	}
}).own({ index: 'draggable' });

/*
---

name: "Geometry"

description: "Base for such things as Point and Shape"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Geometry

...
*/

/** @class Geometry */
var Geometry = declare( 'LibCanvas.Geometry', {
	initialize : function () {
		if (arguments.length) this.set.apply(this, arguments);
	},
	cast: function (args) {
		return this.constructor.castArguments(args);
	}
}).own({
	invoke: declare.castArguments,
	from : function (obj) {
		return this(obj);
	}
});

/*
---

name: "Point"

description: "A X/Y point coordinates encapsulating class"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Geometry
	- Utils.Math

provides: Point

...
*/

/** @class Point */
var Point = LibCanvas.declare( 'LibCanvas.Point', 'Point', Geometry, {
	/**
	 *   new Point(1, 1);
	 *   new Point([1, 1]);
	 *   new Point({x:1, y:1});
	 *   new Point(point);
	 * @constructs
	 * @param {Number} x
	 * @param {Number} y
	 * @returns {Point}
	 */
	set : function (x, y) {
		if (arguments.length != 2) {
			if (atom.core.isArrayLike(x)) {
				y = x[1];
				x = x[0];
			} else if (x && x.x != null && x.y != null) {
				y = x.y;
				x = x.x;
			} else {
				throw new TypeError( 'Wrong Arguments In Point.Set' );
			}
		}

		this.x = Number(x);
		this.y = Number(y);
		return this;
	},
	/** @returns {Point} */
	move: function (distance, reverse) {
		distance = this.cast(distance);
		reverse  = reverse ? -1 : 1;
		this.x += distance.x * reverse;
		this.y += distance.y * reverse;
		return this;
	},
	/** @returns {Point} */
	moveTo : function (point) {
		return this.move(this.diff(this.cast(point)));
	},
	/** @returns {Number} */
	angleTo : function (point) {
		var diff = this.cast(point).diff(this);
		return atom.math.normalizeAngle( Math.atan2(diff.y, diff.x) );
	},
	/** @returns {Number} */
	distanceTo : function (point) {
		var diff = this.cast(point).diff(this);
		return atom.math.hypotenuse(diff.x, diff.y);
	},
	/** @returns {Point} */
	diff : function (point) {
		return new this.constructor(point).move(this, true);
	},
	/** @returns {Point} */
	rotate : function (angle, pivot) {
		pivot = pivot ? this.cast(pivot) : new this.constructor(0, 0);
		if (this.equals(pivot)) return this;

		var radius = pivot.distanceTo(this);
		var sides  = pivot.diff(this);
		// TODO: check, maybe here should be "sides.y, sides.x" ?
		var newAngle = Math.atan2(sides.x, sides.y) - angle;

		return this.moveTo({
			x : Math.sin(newAngle) * radius + pivot.x,
			y : Math.cos(newAngle) * radius + pivot.y
		});
	},
	/** @returns {Point} */
	scale : function (power, pivot) {
		pivot = pivot ? this.cast(pivot) : new this.constructor(0, 0);

		var diff = this.diff(pivot), isObject = typeof power == 'object';
		return this.moveTo({
			x : pivot.x - diff.x  * (isObject ? power.x : power),
			y : pivot.y - diff.y  * (isObject ? power.y : power)
		});
	},
	/** @returns {Point} */
	alterPos : function (arg, fn) {
		return this.moveTo({
			x: fn(this.x, typeof arg == 'object' ? arg.x : arg),
			y: fn(this.y, typeof arg == 'object' ? arg.y : arg)
		});
	},
	/** @returns {Point} */
	mul : function (arg) {
		return this.alterPos(arg, function(a, b) {
			return a * b;
		});
	},
	/** @returns {Point} */
	getNeighbour : function (dir) {
		return this.clone().move(this.constructor.shifts[dir]);
	},
	/** @returns {Point[]} */
	get neighbours () {
		return this.getNeighbours( true );
	},
	/** @returns {Point[]} */
	getNeighbours: function (corners, asObject) {
		var shifts = ['t', 'l', 'r', 'b'], result, i, dir;

		if (corners) shifts.push('tl', 'tr', 'bl', 'br');

		if (asObject) {
			result = {};
			for (i = shifts.length; i--;) {
				dir = shifts[i];
				result[dir] = this.getNeighbour( dir );
			}
			return result;
		} else {
			return shifts.map(this.getNeighbour.bind(this));
		}
	},
	/** @returns {boolean} */
	equals : function (to, accuracy) {
		to = this.cast(to);
		if (accuracy == null) {
			return to.x == this.x && to.y == this.y;
		}
		return atom.number.equals(this.x, to.x, accuracy)
			&& atom.number.equals(this.y, to.y, accuracy);
	},
	/** @returns {object} */
	toObject: function () {
		return { x: this.x, y: this.y };
	},
	/** @returns {Point} */
	invoke: function (method) {
		this.x = this.x[method]();
		this.y = this.y[method]();
		return this;
	},
	/** @returns {Point} */
	map: function (fn, context) {
		this.x = fn.call(context || this, this.x, 'x', this);
		this.y = fn.call(context || this, this.y, 'y', this);
		return this;
	},
	/** @returns {Point} */
	mean: function (points) {
		var l = points.length, i = l, x = 0, y = 0;
		while (i--) {
			x += points[i].x;
			y += points[i].y;
		}
		return this.set(x/l, y/l);
	},
	/** @returns {Point} */
	snapToPixel: function () {
		this.x += 0.5 - (this.x - Math.floor(this.x));
		this.y += 0.5 - (this.y - Math.floor(this.y));
		return this;
	},
	/** @returns {Point} */
	reverse: function () {
		this.x *= -1;
		this.y *= -1;
		return this;
	},
	/** @returns {Point} */
	clone : function () {
		return new this.constructor(this);
	},
	/** @returns {string} */
	dump: function () {
		return '[Point(' + this.x + ', ' + this.y + ')]';
	}
});

Point.shifts = atom.object.map({
	top    : [ 0, -1],
	right  : [ 1,  0],
	bottom : [ 0,  1],
	left   : [-1,  0],
	t      : [ 0, -1],
	r      : [ 1,  0],
	b      : [ 0,  1],
	l      : [-1,  0],
	tl     : [-1, -1],
	tr     : [ 1, -1],
	bl     : [-1,  1],
	br     : [ 1,  1]
}, Point);

/*
---

name: "Size"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point

provides: Size

...
*/

/** @class Size */
var Size = LibCanvas.declare( 'LibCanvas.Size', 'Size', Point, {
	set: function (size) {
		if (typeof size == 'object' && size.width != null) {
			this.x = Number(size.width);
			this.y = Number(size.height);

			return this;
		}
		return Point.prototype.set.apply( this, arguments );
	},

	get width  ( ) { return this.x },
	get height ( ) { return this.y },
	set width  (w) { this.x = w },
	set height (h) { this.y = h },

	/** @returns {object} */
	toObject: function () {
		return { width: this.x, height: this.y };
	}
});

/*
---

name: "Shape"

description: "Abstract class LibCanvas.Shape defines interface for drawable canvas objects"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Geometry
	- Point

provides: Shape

...
*/

var shapeTestBuffer = function () {
	if (!shapeTestBuffer.buffer) {
		return shapeTestBuffer.buffer = LibCanvas.buffer(1, 1, true);
	}
	return shapeTestBuffer.buffer;
};

/** @class Shape */
var Shape = declare( 'LibCanvas.Shape', Geometry, {
	set        : 'abstract',
	hasPoint   : 'abstract',
	processPath: 'abstract',
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	},
	// Методы ниже рассчитывают на то, что в фигуре есть точки from и to
	getCoords : function () {
		return this.from;
	},
	/** @returns {LibCanvas.Shape} */
	grow: function (size) {
		if (typeof size == 'number') {
			size = new Point(size/2, size/2);
		} else {
			size = new Point(size.x/2, size.y/2);
		}

		this.from.move(size, true);
		this. to .move(size);
		return this;
	},
	get x () { return this.from.x },
	get y () { return this.from.y },
	set x (x) {
		return this.move(new Point(x - this.x, 0));
	},
	set y (y) {
		return this.move(new Point(0, y - this.y));
	},
	get bottomLeft () {
		return new Point(this.from.x, this.to.y);
	},
	get topRight() {
		return new Point(this.to.x, this.from.y);
	},
	get center() {
		var from = this.from, to = this.to;
		return new Point( (from.x + to.x) / 2, (from.y + to.y) / 2 );
	},
	getBoundingRectangle: function () {
		return new Rectangle( this.from, this.to );
	},
	getCenter : function () {
		return this.center;
	},
	move : function (distance, reverse) {
		this.from.move(distance, reverse);
		this. to .move(distance, reverse);
		return this;
	},
	equals : function (shape, accuracy) {
		return shape instanceof this.constructor &&
			shape.from.equals(this.from, accuracy) &&
			shape.to  .equals(this.to  , accuracy);
	},
	clone : function () {
		return new this.constructor(this.from.clone(), this.to.clone());
	},
	dumpPoint: function (point) {
		return '[' + point.x + ', ' + point.y + ']';
	},
	dump: function (shape) {
		if (!shape) return this.toString();
		return '[shape '+shape+'(from'+this.dumpPoint(this.from)+', to'+this.dumpPoint(this.to)+')]';
	}
});

/*
---

name: "Shapes.Rectangle"

description: "Provides rectangle as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Rectangle

...
*/

/** @class Rectangle */
var Rectangle = LibCanvas.declare( 'LibCanvas.Shapes.Rectangle', 'Rectangle', Shape, {
	set : function () {
		var a = atom.array.pickFrom(arguments);

		if (a.length == 4) {
			this.from = new Point(a[0], a[1]);
			this.to   = new Point(a[0]+a[2], a[1]+a[3]);
		} else if (a.length == 2) {
			if ('width' in a[1] && 'height' in a[1]) {
				this.set({ from: a[0], size: a[1] });
			} else {
				this.from = Point(a[0]);
				this.to   = Point(a[1]);
			}
		} else {
			a = a[0];
			if (a.from) {
				this.from = Point(a.from);
			} else if ('x' in a && 'y' in a) {
				this.from = new Point(a.x, a.y);
			}
			if (a.to) this.to = Point(a.to);

			if (!a.from || !a.to) {
				var as = a.size,
					sizeX = atom.array.pick(as ? [as.w, as[0], as.width ] : [ a.w, a.width  ]),
					sizeY = atom.array.pick(as ? [as.h, as[1], as.height] : [ a.h, a.height ]);
				if (this.from) {
					this.to   = new Point(this.from.x + sizeX, this.from.y + sizeY);
				} else {
					this.from = new Point(this.to.x   - sizeX, this.to.y   - sizeY);
				}
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
		this.to.x = this.from.x + width;
	},
	set height (height) {
		this.to.y = this.from.y + height;
	},
	get size () {
		return new Size( this.width, this.height );
	},
	set size (size) {
		if (size.width != this.width || size.height != this.height) {
			this.to.set(this.from.x + size.width, this.from.y + size.height);
		}
	},
	/** @returns {boolean} */
	hasPoint : function (point, padding) {
		point   = Point(arguments);
		padding = padding || 0;
		return point.x != null && point.y != null
			&& atom.number.between(point.x, Math.min(this.from.x, this.to.x) + padding, Math.max(this.from.x, this.to.x) - padding, 1)
			&& atom.number.between(point.y, Math.min(this.from.y, this.to.y) + padding, Math.max(this.from.y, this.to.y) - padding, 1);
	},
	align: function (rect, sides) {
		if (sides == null) sides = 'center middle';

		var moveTo = this.from.clone();
		if (sides.indexOf('left') != -1) {
			moveTo.x = rect.from.x;
		} else if (sides.indexOf('center') != -1) {
			moveTo.x = rect.from.x + (rect.width - this.width) / 2;
		} else if (sides.indexOf('right') != -1) {
			moveTo.x = rect.to.x - this.width;
		}

		if (sides.indexOf('top') != -1) {
			moveTo.y = rect.from.y;
		} else if (sides.indexOf('middle') != -1) {
			moveTo.y = rect.from.y + (rect.height - this.height) / 2;
		} else if (sides.indexOf('bottom') != -1) {
			moveTo.y = rect.to.y - this.height;
		}

		return this.moveTo( moveTo );
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	moveTo: function (rect) {
		if (rect instanceof Point) {
			this.move( this.from.diff(rect) );
		} else {
			rect = Rectangle(arguments);
			this.from.moveTo(rect.from);
			this.  to.moveTo(rect.to);
		}
		return this;
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	draw : function (ctx, type) {
		// fixed Opera bug - cant drawing rectangle with width or height below zero
		ctx.original(type + 'Rect', [
			Math.min(this.from.x, this.to.x),
			Math.min(this.from.y, this.to.y),
			Math.abs(this.width ),
			Math.abs(this.height)
		]);
		return this;
	},
	/** @returns {LibCanvas.Context2D} */
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		ctx.ctx2d.rect( this.from.x, this.from.y, this.width, this.height );
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	/** @returns {boolean} */
	intersect : function (obj) {
		if (obj.prototype != this.constructor) {
			if (obj.getBoundingRectangle) {
				obj = obj.getBoundingRectangle();
			} else return false;
		}
		return this.from.x < obj.to.x && this.to.x > obj.from.x
			&& this.from.y < obj.to.y && this.to.y > obj.from.y;
	},
	getBoundingRectangle: function () {
		return this;
	},
	/** @returns {LibCanvas.Point} */
	getRandomPoint : function (margin) {
		margin = margin || 0;
		return new Point(
			atom.number.random(margin, this.width  - margin),
			atom.number.random(margin, this.height - margin)
		);
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	translate : function (point, fromRect) {
		var diff = fromRect.from.diff(point);
		return new Point({
			x : (diff.x / fromRect.width ) * this.width,
			y : (diff.y / fromRect.height) * this.height
		});
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	fillToPixel: function () {
		var from = this.from, to = this.to,
			point = function (side, round) {
				return new Point(
					Math[round](Math[side](from.x, to.x)),
					Math[round](Math[side](from.y, to.y))
				);
			};

		return new Rectangle(
			point( 'min', 'floor' ),
			point( 'max', 'ceil'  )
		);
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	snapToPixel: function () {
		this.from.snapToPixel();
		this.to.snapToPixel().move(new Point(-1, -1));
		return this;
	},
	/** @returns {string} */
	dump: function (name) {
		return Shape.prototype.dump.call(this, name || 'Rectangle');
	},
	/** @returns {LibCanvas.Shapes.Polygon} */
	toPolygon: function () {
		return new Polygon(
			this.from.clone(), this.topRight, this.to.clone(), this.bottomLeft
		);
	}
});

/*
---

name: "Shapes.Circle"

description: "Provides circle as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Circle

...
*/

/** @class Circle */
var Circle = LibCanvas.declare( 'LibCanvas.Shapes.Circle', 'Circle', Shape, {
	set : function () {
		var a = atom.array.pickFrom(arguments);

		if (a.length >= 3) {
			this.center = new Point(a[0], a[1]);
			this.radius = a[2];
		} else if (a.length == 2) {
			this.center = Point(a[0]);
			this.radius = a[1];
		} else {
			a = a[0];
			this.radius = a.r == null ? a.radius : a.r;
			if ('x' in a && 'y' in a) {
				this.center = new Point(a.x, a.y);
			} else if ('center' in a) {
				this.center = Point(a.center);
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
	// we need accessors to redefine parent "get center"
	get center ( ) { return this._center; },
	set center (c) { this._center = c; },
	grow: function (size) {
		this.radius += size/2;
		return this;
	},
	getCoords : function () {
		return this.center;
	},
	hasPoint : function (point) {
		return this.center.distanceTo(point) <= this.radius;
	},
	scale : function (factor, pivot) {
		if (pivot) this.center.scale(factor, pivot);
		this.radius *= factor;
		return this;
	},
	getCenter: function () {
		return this.center;
	},
	intersect : function (obj) {
		if (obj instanceof this.constructor) {
			return this.center.distanceTo(obj.center) < this.radius + obj.radius;
		} else {
			return this.getBoundingRectangle().intersect( obj );
		}
	},
	move : function (distance, reverse) {
		this.center.move(distance, reverse);
		return this;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		if (this.radius) {
			ctx.arc({
				circle : this,
				angle  : [0, Math.PI * 2]
			});
		}
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	getBoundingRectangle: function () {
		var r = this.radius, center = this.center;
		return new Rectangle(
			new Point(center.x - r, center.y - r),
			new Point(center.x + r, center.y + r)
		);
	},
	clone : function () {
		return new this.constructor(this.center.clone(), this.radius);
	},
	getPoints : function () {
		return { center : this.center };
	},
	equals : function (shape, accuracy) {
		return shape instanceof this.shape &&
			shape.radius == this.radius    &&
			shape.center.equals(this.center, accuracy);
	},
	dump: function () {
		return '[shape Circle(center['+this.center.x+', '+this.center.y+'], '+this.radius+')]';
	}
});

/*
---

name: "Utils.Canvas"

description: "Provides some Canvas extensions"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Utils.Canvas

...
*/

atom.core.append(HTMLCanvasElement,
/** @lends HTMLCanvasElement */
{
	/** @private */
	_newContexts: {},
	/** @returns {HTMLCanvasElement} */
	addContext: function (name, ctx) {
		this._newContexts[name] = ctx;
		return this;
	},
	/** @returns {Context2D} */
	getContext: function (name) {
		return this._newContexts[name] || null;
	}
});

atom.core.append(HTMLCanvasElement.prototype,
/** @lends HTMLCanvasElement.prototype */
{
	getOriginalContext: HTMLCanvasElement.prototype.getContext,
	/** @returns {Context2D} */
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

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Size
	- Shapes.Rectangle
	- Shapes.Circle
	- Utils.Canvas

provides: Context2D

...
*/

/**
 * @class
 * @name Context2D
 * @name LibCanvas.Context2D
 */
var Context2D = function () {

var office = {
	all : function (type, style) {
		this.save();
		if (style) this.set(type + 'Style', style);
		this[type + 'Rect'](this.rectangle);
		this.restore();
		return this;
	},
	rect : function (func, args) {
		var rect = office.makeRect.call(this, args);
		return this.original(func,
			[rect.from.x, rect.from.y, rect.width, rect.height]);
	},
	makeRect: function (args) {
		return args.length ? Rectangle(args) : this.rectangle;
	},
	fillStroke : function (type, args) {
		if (args.length >= 1 && args[0] instanceof Shape) {
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
		var point = Point(args);
		return this.original(func, [point.x, point.y]);
	}
};

var size1 = new Size(1,1);

/* In some Mobile browsers shadowY should be inverted (bug) */
var shadowBug = function () {
	// todo: use LibCanvas.buffer
	var ctx = atom.dom
		.create('canvas', { width: 15, height: 15 })
		.first.getContext( '2d' );

	ctx.shadowBlur    = 1;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = -5;
	ctx.shadowColor   = 'green';

	ctx.fillRect( 0, 5, 5, 5 );

	// Color should contains green component to be correct (128 is correct value)
	return ctx.getImageData(0, 0, 1, 1).data[1] < 64;

}();

var constants =
/** @lends LibCanvas.Context2D */
{
	COMPOSITE: {
		SOURCE_OVER: 'source-over',
		SOURCE_IN  : 'source-in',
		SOURCE_OUT : 'source-out',
		SOURCE_ATOP: 'source-atop',

		DESTINATION_OVER: 'destination-over',
		DESTINATION_IN  : 'destination-in',
		DESTINATION_OUT : 'destination-out',
		DESTINATION_ATOP: 'destination-atop',

		LIGHTER: 'lighter',
		DARKER : 'darker',
		COPY   : 'copy',
		XOR    : 'xor'
	},

	LINE_CAP: {
		BUTT  : 'butt',
		ROUND : 'round',
		SQUARE: 'square'
	},

	LINE_JOIN: {
		ROUND: 'round',
		BEVEL: 'bevel',
		MITER: 'miter'
	},

	TEXT_ALIGN: {
		LEFT  : 'left',
		RIGHT : 'right',
		CENTER: 'center',
		START : 'start',
		END   : 'end'
	},

	TEXT_BASELINE: {
		TOP        : 'top',
		HANGING    : 'hanging',
		MIDDLE     : 'middle',
		ALPHABETIC : 'alphabetic',
		IDEOGRAPHIC: 'ideographic',
		BOTTOM     : 'bottom'
	},

	SHADOW_BUG: shadowBug

};

var Context2D = LibCanvas.declare( 'LibCanvas.Context2D', 'Context2D',
/**
 * @lends LibCanvas.Context2D.prototype
 * @property {string} fillStyle
 * @property {string} font
 * @property {number} globalAlpha
 * @property {string} globalCompositeOperation
 * @property {string} lineCap
 * @property {string} lineJoin
 * @property {number} lineWidth
 * @property {number} miterLimit
 * @property {number} shadowOffsetX
 * @property {number} shadowOffsetY
 * @property {number} shadowBlur
 * @property {string} shadowColor
 * @property {string} strokeStyle
 * @property {string} textAlign
 * @property {string} textBaseline
 */
{
	initialize : function (canvas) {
		if (canvas instanceof CanvasRenderingContext2D) {
			this.ctx2d  = canvas;
			this.canvas = this.ctx2d.canvas;
		} else {
			this.canvas = canvas;
			this.ctx2d  = canvas.getOriginalContext('2d');
		}
	},
	get width () { return this.canvas.width; },
	get height() { return this.canvas.height; },
	set width (width)  { this.canvas.width  = width; },
	set height(height) { this.canvas.height = height;},

	get shadow () {
		return [this.shadowOffsetX, this.shadowOffsetY, this.shadowBlur, this.shadowColor].join( ' ' );
	},

	set shadow (value) {
		value = value.split( ' ' );
		this.shadowOffsetX = value[0];
		this.shadowOffsetY = value[1];
		this.shadowBlur    = value[2];
		this.shadowColor   = value[3];
	},

	/** @private */
	safeSet: function (property, value) {
		try {
			this.ctx2d[property] = value;
		} catch (e) {
			throw TypeError('Exception while setting «' + property + '» to «' + value + '»: ' + e.message);
		}
	},

	set shadowOffsetY (value) {
		if (shadowBug) value *= -1;
		this.safeSet('shadowOffsetY', value);
	},

	set shadowBlur (value) {
		if (shadowBug && value < 1) value = 1;
		this.safeSet('shadowBlur', value);
	},

	get shadowOffsetY () {
		return this.ctx2d.shadowOffsetY;
	},

	get shadowBlur () {
		return this.ctx2d.shadowBlur;
	},

	get opacity () {
		return this.globalAlpha;
	},

	set opacity (value) {
		this.globalAlpha = value;
	},

	_rectangle: null,
	/** @returns {Rectangle} */
	get rectangle () {
		var rect = this._rectangle;
		if (!rect) {
			this._rectangle = rect = new Rectangle(0, 0, this.width, this.height)
		} else {
			rect.size = this;
		}
		return rect;
	},
	/** @returns {Context2D} */
	original : function (method, args, returnResult) {
		try {
			var result = this.ctx2d[method].apply(this.ctx2d, args || []);
			if (returnResult) return result;
		} catch (e) {
			console.log('Error in context2d.original(', method, ',', (args || []), ')');
			throw e;
		}
		return this;
	},
	/** @returns {HTMLCanvasElement} */
	getClone : function (width, height) {
		var resize = !!(width || height), canvas = this.canvas;
		width  = width  || canvas.width;
		height = height || canvas.height;

		var args = [canvas, 0, 0];
		if (resize) args.push(width, height);

		var clone = LibCanvas.buffer(width, height, true);
		clone.ctx.original('drawImage', args);
		return clone;
	},

	// Values
	/** @returns {Context2D} */
	set : function (name, value) {
		if (typeof name == 'object') {
			for (var i in name) this[i] = name[i];
		} else this[name] = value;
		return this;
	},
	/** @returns {string} */
	get : function (name) {
		return this[name];
	},

	// All
	/** @returns {Context2D} */
	fillAll : function (style) {
		return office.all.call(this, 'fill', style);
	},
	/** @returns {Context2D} */
	strokeAll : function (style) {
		return office.all.call(this, 'stroke', style);
	},
	/** @returns {Context2D} */
	clearAll : function (style) {
		return office.all.call(this, 'clear', style);
	},

	// Save/Restore
	/** @returns {Context2D} */
	save : function () {
		return this.original('save');
	},
	/** @returns {Context2D} */
	restore : function () {
		return this.original('restore');
	},

	// Fill/Stroke
	/** @returns {Context2D} */
	fill : function (shape) {
		return office.fillStroke.call(this, 'fill', arguments);
	},
	/** @returns {Context2D} */
	stroke : function (shape) {
		return office.fillStroke.call(this, 'stroke', arguments);
	},
	/** @returns {Context2D} */
	clear: function (shape, stroke) {
		return shape instanceof Shape && shape.constructor != Rectangle ?
			this
				.save()
				.set({ globalCompositeOperation: Context2D.COMPOSITE.DESTINATION_OUT })
				[stroke ? 'stroke' : 'fill']( shape )
				.restore() :
			this.clearRect( Rectangle(arguments) );
	},

	// Path
	/** @returns {Context2D} */
	beginPath : function (moveTo) {
		var ret = this.original('beginPath');
		arguments.length && this.moveTo.apply(this, arguments);
		return ret;
	},
	/** @returns {Context2D} */
	closePath : function () {
		arguments.length && this.lineTo.apply(this, arguments);
		return this.original('closePath');
	},
	/** @returns {Context2D} */
	moveTo : function (point) {
		return office.originalPoint.call(this, 'moveTo', arguments);
	},
	/** @returns {Context2D} */
	lineTo : function (point) {
		return office.originalPoint.call(this, 'lineTo', arguments);
	},

	/** @returns {Context2D} */
	arc : function (x, y, r, startAngle, endAngle, anticlockwise) {
		var a = atom.array.pickFrom(arguments), circle, angle, acw;
		if (a.length > 1) {
			return this.original('arc', a);
		} else if ('circle' in a[0]) {
			circle = Circle(a[0].circle);
			angle  = Array.isArray(a[0].angle) ?
				atom.array.associate(a[0].angle, ['start', 'end']) :
				atom.object.collect(a[0].angle, ['start', 'end', 'size']);

			if (Array.isArray(angle)) {
				angle = atom.array.associate(angle, ['start', 'end']);
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

	/** @returns {Context2D} */
	arcTo : function () {
		// @todo Beauty arguments
		return this.original('arcTo', arguments);
	},
	/** @returns {Context2D} */
	curveTo: function (curve) {
		var p, l, to;

		if (typeof curve == 'number') {
			if (arguments.length === 4) {
				return this.original('quadraticCurveTo', arguments);
			} else if (arguments.length === 6) {
				return this.original('bezierCurveTo', arguments);
			}
		} else if (arguments.length > 1) {
			p  = atom.array.from( arguments ).map(Point);
			to = p.shift()
		} else {
			p  = atom.array.from( curve.points ).map(Point);
			to = Point(curve.to);
		}

		l = p.length;

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
	/** @returns {Context2D} */
	quadraticCurveTo : function () {
		var a = arguments;
		if (a.length == 4) {
			return this.original('bezierCurveTo', arguments);
		} else {
			a = a.length == 2 ? atom.array.associate(a, ['p', 'to']) : a[0];
			return this.curveTo({
				to: a.to,
				points: [a.p]
			});
		}
	},
	/** @returns {Context2D} */
	bezierCurveTo : function () {
		var a = arguments;
		if (a.length == 6) {
			return this.original('bezierCurveTo', arguments);
		} else {
			a = a.length == 3 ? {p1:a[0], p2:a[1], to:a[2]} : a[0];
			return this.curveTo({
				to: a.to,
				points: [a.p1, a.p2]
			});
		}
	},
	/** @returns {boolean} */
	isPointInPath : function (x, y) {
		var point = Point(arguments);
		return this.original('isPointInPath', [point.x, point.y], true);
	},
	/** @returns {Context2D} */
	clip : function (shape) {
		if (shape && typeof shape.processPath == 'function') {
			shape.processPath(this);
		}
		return this.original('clip');
	},

	// transformation
	/** @returns {Context2D} */
	rotate : function (angle, pivot) {
		if (angle) {
			if (pivot) this.translate(pivot);
			this.original('rotate', [angle]);
			if (pivot) this.translate(pivot, true);
		}
		return this;
	},
	/** @returns {Context2D} */
	translate : function (point, reverse) {
		point = Point(
			(arguments.length === 1 || typeof reverse === 'boolean')
				? point : arguments
		);
		var multi = reverse === true ? -1 : 1;
		this.original('translate', [point.x * multi, point.y * multi]);
		return this;
	},
	/** @returns {Context2D} */
	scale : function (power, pivot) {
		if (typeof pivot == 'number') {
			power = new Point(power, pivot);
			pivot = null;
		} else {
			power = Point(power);
		}
		if (power.x != 1 || power.y != 1) {
			if (pivot) this.translate(pivot);
			this.original('scale', [power.x, power.y]);
			if (pivot) this.translate(pivot, true);
		}
		return this;
	},
	/** @returns {Context2D} */
	transform : function () {
		// @todo Beauty arguments
		return this.original('transform', arguments);
	},
	/** @returns {Context2D} */
	setTransform : function () {
		// @todo Beauty arguments
		return this.original('setTransform', arguments);
	},

	// Rectangle
	/** @returns {Context2D} */
	fillRect : function (rectangle) {
		return office.rect.call(this, 'fillRect', arguments);
	},
	/** @returns {Context2D} */
	strokeRect : function (rectangle) {
		return office.rect.call(this, 'strokeRect', arguments);
	},
	/** @returns {Context2D} */
	clearRect : function (rectangle) {
		return office.rect.call(this, 'clearRect', arguments);
	},

	// text
	/** @returns {Context2D} */
	fillText : function (text, x, y, maxWidth) {
		var type = typeof x;
		if (type != 'number' && type != 'string') {
			maxWidth = y;
			x = Point( x );
			y = x.y;
			x = x.x;
		}
		var args = [text, x, y];
		if (maxWidth) args.push( maxWidth );
		return this.original('fillText', args);
	},
	/** @returns {Context2D} */
	strokeText : function (text, x, y, maxWidth) {
		var type = typeof x;
		if (type != 'number' && type != 'string') {
			maxWidth = y;
			x = Point( x );
			y = x.y;
			x = x.x;
		}
		var args = [text, x, y];
		if (maxWidth) args.push( maxWidth );
		return this.original('strokeText', args);
	},
	/** @returns {object} */
	measureText : function (textToMeasure) {
		return this.original('measureText', arguments, true);
	},
	/** @returns {Context2D} */
	text : function (cfg) {
		if (!this.ctx2d.fillText) return this;

		cfg = atom.core.append({
			text   : '',
			color  : null, /* @color */
			wrap   : 'normal', /* no|normal */
			to     : null,
			align  : 'left', /* center|left|right */
			size   : 16,
			weigth : 'normal', /* bold|normal */
			style  : 'normal', /* italic|normal */
			family : 'arial,sans-serif', /* @fontFamily */
			lineHeight : null,
			overflow   : 'visible', /* hidden|visible */
			padding : [0,0],
			shadow : null
		}, cfg);

		this.save();
		if (atom.typeOf(cfg.padding) == 'number') {
			cfg.padding = [cfg.padding, cfg.padding];
		}
		var to = cfg.to ? Rectangle(cfg.to) : this.rectangle;
		var lh = Math.round(cfg.lineHeight || (cfg.size * 1.15));
		this.set('font', atom.string.substitute(
			'{style}{weight}{size}px {family}', {
				style  : cfg.style == 'italic' ? 'italic ' : '',
				weight : cfg.weight == 'bold'  ? 'bold '   : '',
				size   : cfg.size,
				family : cfg.family
			})
		);
		if (cfg.shadow) this.shadow = cfg.shadow;
		if (cfg.color) this.set({ fillStyle: cfg.color });
		if (cfg.overflow == 'hidden') this.clip(to);

		var xGet = function (lineWidth) {
			var al = cfg.align, pad = cfg.padding[1];
			return Math.round(
				al == 'left'  ? to.from.x + pad :
				al == 'right' ? to.to.x - lineWidth - pad :
					to.from.x + (to.width - lineWidth)/2
			);
		};
		var lines = String(cfg.text).split('\n');

		var measure = function (text) { return Number(this.measureText(text).width); }.bind(this);
		if (cfg.wrap == 'no') {
			lines.forEach(function (line, i) {
				if (!line) return;

				this.fillText(line, xGet(cfg.align == 'left' ? 0 : measure(line)), to.from.y + (i+1)*lh);
			}.bind(this));
		} else {
			var lNum = 0;
			lines.forEach(function (line) {
				if (!line) {
					lNum++;
					return;
				}

				var words = (line || ' ').match(/.+?(\s|$)/g);
				if (!words) {
					lNum++;
					return;
				}
				var L  = '';
				var Lw = 0;
				for (var i = 0; i <= words.length; i++) {
					var last = i == words.length;
					if (!last) {
						var text = words[i];
						// @todo too slow. 2-4ms for 50words
						var wordWidth = measure(text);
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
			}.bind(this));

		}
		return this.restore();
	},

	// image
	/** @returns {Context2D} */
	drawImage : function (a) {
		if (arguments.length > 2) return this.original('drawImage', arguments);
		if (arguments.length == 2) {
			a = { image: a, draw: arguments[1] };
		} else if (atom.typeOf(a) == 'element') {
			return this.original('drawImage', [a, 0, 0]);
		}

		if (!a.image) throw new TypeError('No image');
		var center, from = a.center || a.from;

		var scale = a.scale ? Point(a.scale) : null;

		var transform = function (a, center) {
			if (a.angle) this.rotate(a.angle, center);
			if (scale  ) this.scale( scale, center );
		}.bind(this);

		var needTransform = a.angle || (scale && (scale.x != 1 || scale.y != 1));

		this.save();
		if (from) {
			from = Point(from);
			if (a.center) from = {
				x : from.x - a.image.width/2,
				y : from.y - a.image.height/2
			};
			if (needTransform) {
				center = a.center || {
					x : from.x + a.image.width/2,
					y : from.y + a.image.height/2
				};
				transform(a, center);
			} else if (a.optimize) {
				from = { x: Math.round(from.x), y: Math.round(from.y) }
			}
			this.original('drawImage', [
				a.image, from.x, from.y
			]);
		} else if (a.draw) {
			var draw = Rectangle(a.draw);
			if (needTransform) transform(a, draw.center);

			if (a.crop) {
				var crop = Rectangle(a.crop);
				this.original('drawImage', [
					a.image,
					crop.from.x, crop.from.y, crop.width, crop.height,
					draw.from.x, draw.from.y, draw.width, draw.height
				]);
			} else if (a.optimize) {
				var size = draw.size, dSize = {
					x: Math.abs(size.width  - a.image.width ),
					y: Math.abs(size.height - a.image.height)
				};
				from = { x:Math.round(draw.from.x), y: Math.round(draw.from.y) };
				if (dSize.x <= 1.1 && dSize.y <= 1.1 ) {
					this.original('drawImage', [ a.image, from.x, from.y ]);
				} else {
					this.original('drawImage', [
						a.image, from.x, from.y, Math.round(size.width), Math.round(size.height)
					]);
				}
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

	// image data
	/** @returns {CanvasPixelArray} */
	createImageData : function () {
		var w, h;

		var args = atom.array.pickFrom(arguments);
		switch (args.length) {
			case 0:{
				w = this.canvas.width;
				h = this.canvas.height;
			} break;

			case 1: {
				var obj = args[0];
				if (atom.typeOf(obj) == 'object' && ('width' in obj) && ('height' in obj)) {
					w = obj.width;
					h = obj.height;
				}
				else {
					throw new TypeError('Wrong argument in the Context.createImageData');
				}
			} break;

			case 2: {
				w = args[0];
				h = args[1];
			} break;

			default: throw new TypeError('Wrong args number in the Context.createImageData');
		}

		return this.original('createImageData', [w, h], true);
	},

	/** @returns {Context2D} */
	putImageData : function () {
		var a = arguments, put = {}, args, rect;

		switch (a.length) {
			case 1: {
				if (!typeof a == 'object') {
					throw new TypeError('Wrong argument in the Context.putImageData');
				}

				a = a[0];
				put.image = a.image;
				put.from = Point(a.from);

				if (a.crop) put.crop = Rectangle(a.crop);
			} break;

			case 3: {
				put.image = a[0];
				put.from = Point([a[1], a[2]]);
			} break;

			case 7: {
				put.image = a[0];
				put.from = new Point(a[1], a[2]);
				put.crop = new Rectangle(a[3], a[4], a[5], a[6]);
			} break;

			default : throw new TypeError('Wrong args number in the Context.putImageData');
		}

		args = [put.image, put.from.x, put.from.y];

		if (put.crop) {
			rect = put.crop;
			atom.array.append(args, [rect.from.x, rect.from.y, rect.width, rect.height])
		}

		return this.original('putImageData', args);
	},
	/** @returns {CanvasPixelArray} */
	getImageData : function (rectangle) {
		var rect = office.makeRect.call(this, arguments);

		return this.original('getImageData', [rect.from.x, rect.from.y, rect.width, rect.height], true);
	},
	getPixels : function (rectangle) {
		var rect = Rectangle(arguments),
			data = this.getImageData(rect).data,
			result = [],
			line = [];
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

	getPixel: function (point) {
		var
			rect = new Rectangle(Point( arguments ), size1),
			data = slice.call(this.getImageData(rect).data);
		data[3] /= 255;

		return new atom.Color(data);
	},


	/** @returns {CanvasGradient} */
	createGradient: function (from, to, colors) {
		var gradient;
		if ( from instanceof Rectangle ) {
			colors   = to;
			gradient = this.createLinearGradient( from );
		} else if (from instanceof Circle) {
			gradient = this.createRadialGradient( from, to );
		} else if (from instanceof Point) {
			gradient = this.createLinearGradient( from, to, colors );
		} else {
			throw new Error('Unknown arguments');
		}
		if (typeof colors == 'object') gradient.addColorStop( colors );
		return gradient;
	},
	/** @returns {CanvasGradient} */
	createRectangleGradient: function (rectangle, colors) {
		rectangle = Rectangle( rectangle );

		var from = rectangle.from, line = new Line( rectangle.bottomLeft, rectangle.topRight );

		return this.createGradient( from, line.perpendicular(from).scale(2, from), colors );
	},
	/** @returns {CanvasGradient} */
	createLinearGradient : function (from, to) {
		var a = arguments;
		if (a.length != 4) {
			if (a.length == 2) {
				to   = Point(to);
				from = Point(from);
			} else if (a.length == 1) {
				// wee
				to   = Point(a[0].to);
				from = Point(a[0].from);
			}
			a = [from.x, from.y, to.x, to.y];
		}
		return fixGradient( this.original('createLinearGradient', a, true) );
	},
	/** @returns {CanvasGradient} */
	createRadialGradient: function () {
		var points, c1, c2, a = arguments;
		if (a.length == 1 || a.length == 2) {
			if (a.length == 2) {
				c1 = Circle( a[0] );
				c2 = Circle( a[1] );
			} else {
				c1 = Circle( a.start );
				c2 = Circle( a.end   );
			}
			points = [c1.center.x, c1.center.y, c1.radius, c2.center.x, c2.center.y, c2.radius];
		} else if (a.length == 6) {
			points = a;
		} else {
			throw new TypeError('Wrong args number in the Context.createRadialGradient');
		}

		return fixGradient( this.original('createRadialGradient', points, true) );
	},

	/** @returns {CanvasPattern} */
	createPattern : function () {
		return this.original('createPattern', arguments, true);
	},

	drawWindow : function () {
		return this.original('drawWindow', arguments);
	}

}).own(constants);


[ 'fillStyle','font','globalAlpha','globalCompositeOperation','lineCap',
  'lineJoin','lineWidth','miterLimit','shadowOffsetX','shadowColor',
	'strokeStyle','textAlign','textBaseline'
	// we'll set this values manually because of bug in Mobile Phones
	// 'shadowOffsetY','shadowBlur'
].forEach(function (property) {
	atom.accessors.define(Context2D.prototype, property, {
		set: function (value) {
			this.safeSet(property, value);
		},
		get: function () {
			return this.ctx2d[property];
		}
	})
});

var addColorStop = function () {
	var orig = document
		.createElement('canvas')
		.getContext('2d')
		.createLinearGradient(0,0,1,1)
		.addColorStop;
		
	return function (colors) {
		if (typeof colors == 'object') {
			for (var position in colors) {
				orig.call( this, parseFloat(position), colors[position] );
			}
		} else {
			orig.apply( this, arguments );
		}
		return this;
	};
}();


var fixGradient = function (grad) {
	grad.addColorStop = addColorStop;
	return grad;
};

Context2D.office = office;

if (atom.core.isFunction(HTMLCanvasElement.addContext)) {
	HTMLCanvasElement.addContext('2d-libcanvas', Context2D);
}

return Context2D;
}();

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
			e.delta =
				// IE, Opera, Chrome
				e.wheelDelta ? e.wheelDelta > 0 ? 1 : -1 :
				// Fx
				e.detail     ? e.detail     < 0 ? 1 : -1 : null;
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

/*
---

name: "Point3D"

description: "A X/Y/Z point coordinates encapsulating class"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Geometry

provides: Point3D

...
*/

/** @class Point3D */
var Point3D = LibCanvas.declare( 'LibCanvas.Point3D', 'Point3D', Geometry, {
	x: 0,
	y: 0,
	z: 0,

	/** @private */
	coordinatesArray: ['x', 'y', 'z'],

	/**
	 * @constructs
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 * @returns {Point3D}
	 */
	set: function (x, y, z) {
		if ( arguments.length > 1 ) {
			this.x = Number(x) || 0;
			this.y = Number(y) || 0;
			this.z = Number(z) || 0;
		} else if ( x && typeof x.x  === 'number' ) {
			this.set( x.x, x.y, x.z );
		} else if ( x && typeof x[0] === 'number' ) {
			this.set( x[0], x[1], x[2] );
		} else {
			throw new Error( 'Wrong arguments in Isometric.Point3D' );
		}
		return this;
	},

	/**
	 * You can pass callback (function( value, axis, point ){})
	 * @param {function} fn
	 * @param {object} context
	 * @returns {Point3D}
	 */
	map: function (fn, context) {
		var point = this;
		point.coordinatesArray.forEach(function (axis) {
			point[axis] = fn.call( context || point, point[axis], axis, point );
		});
		return this;
	},

	/**
	 * @param {Number} factor
	 * @returns {Point3D}
	 */
	add: function (factor) {
		return this.map(function (c) { return c+factor });
	},

	/**
	 * @param {Number} factor
	 * @returns {Point3D}
	 */
	mul: function (factor) {
		return this.map(function (c) { return c*factor });
	},

	/**
	 * @param {Point3D} point3d
	 * @returns {Point3D}
	 */
	diff: function (point3d) {
		point3d = this.cast( point3d );
		return new this.constructor(
			point3d.x - this.x,
			point3d.y - this.y,
			point3d.z - this.z
		);
	},

	/**
	 * @param {Point3D} point3d
	 * @returns {Point3D}
	 */
	move: function (point3d) {
		point3d = this.cast( arguments );
		this.x += point3d.x;
		this.y += point3d.y;
		this.z += point3d.z;
		return this;
	},

	/**
	 * @param {Point3D} point3d
	 * @param {Number} accuracy
	 * @returns {boolean}
	 */
	equals: function (point3d, accuracy) {
		return point3d.x.equals( this.x, accuracy ) &&
		       point3d.y.equals( this.y, accuracy ) &&
		       point3d.z.equals( this.z, accuracy );
	},

	/** @returns {Point3D} */
	clone: function () {
		return new this.constructor( this );
	},

	/** @returns Array */
	toArray: function () {
		return [this.x, this.y, this.z];
	},

	/** @returns String */
	dump: function () {
		return '[LibCanvas.Point3D(' + this.toArray() + ')]';
	}
});

/*
---

name: "HexProjection"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Polygon

provides: Engines.HexProjection

...
*/

/** @class HexProjection */
LibCanvas.declare( 'LibCanvas.Engines.HexProjection', 'HexProjection', {
	/**
	 * @param {object} settings
	 * @param {int} settings.baseLength  - length of top and bottom lines
	 * @param {int} settings.chordLength - height of left and right triangle
	 * @param {int} settings.hexHeight   - height of the hex (length between top and bottom lines)
	 */
	initialize: function (settings) {
		this.settings = new Settings({
			baseLength : 0,
			chordLength: 0,
			hexHeight  : 0,
			start      : new Point(0, 0)
		}).set(settings);
	},

	/**
	 * @param {int} [padding=0]
	 * @return LibCanvas.Engines.HexProjection.Sizes
	 */
	sizes: function (padding) {
		return LibCanvas.Engines.HexProjection.Sizes(this, padding);
	},

	/**
	 * @param {int[]} coordinates
	 * @return Point
	 */
	rgbToPoint: function (coordinates) {
		var
			red      = coordinates[0],
			green    = coordinates[1],
			blue     = coordinates[2],
			settings = this.settings,
			base     = settings.get('baseLength'),
			chord    = settings.get('chordLength'),
			height   = settings.get('hexHeight'),
			start    = settings.get('start');
		if (red + green + blue !== 0) {
			throw new Error( 'Wrong coordinates: ' + red + ' ' + green + ' ' + blue);
		}

		return new Point(
			start.x + (base + chord) * red,
			start.y + (blue - green) * height / 2
		);
	},

	/**
	 * @param {Point} point
	 * @return int[]
	 */
	pointToRgb: function (point) {
		var
			settings = this.settings,
			base     = settings.get('baseLength'),
			chord    = settings.get('chordLength'),
			height   = settings.get('hexHeight'),
			start    = settings.get('start'),
			// counting coords
			red   = (point.x - start.x) / (base + chord),
			blue  = (point.y - start.y - red * height / 2) / height,
			green = 0 - red - blue;

		var dist = function (c) {
			return Math.abs(c[0] - red) + Math.abs(c[1] - green) + Math.abs(c[2] - blue);
		};

		var
			rF = Math.floor(red  ), rC = Math.ceil(red  ),
			gF = Math.floor(green), gC = Math.ceil(green),
			bF = Math.floor(blue ), bC = Math.ceil(blue );

		return [
			// we need to find closest integer coordinates
			[rF, gF, bF],
			[rF, gC, bF],
			[rF, gF, bC],
			[rF, gC, bC],
			[rC, gF, bF],
			[rC, gC, bF],
			[rC, gF, bC],
			[rC, gC, bC]
		].filter(function (v) {
			// only correct variants - sum must be equals to zero
			return atom.array.sum(v) == 0;
		})
		.sort(function (left, right) {
			// we need coordinates with the smallest distance
			return dist(left) < dist(right) ? -1 : 1;
		})[0];
	},

	/**
	 * @param {Point} center
	 * @return LibCanvas.Shapes.Polygon
	 */
	createPolygon: function (center) {
		var
			settings   = this.settings,
			halfBase   = settings.get('baseLength') / 2,
			halfHeight = settings.get('hexHeight')  / 2,
			radius     = halfBase + settings.get('chordLength'),

			right  = center.x + halfBase,
			left   = center.x - halfBase,
			top    = center.y - halfHeight,
			bottom = center.y + halfHeight;

		return new Polygon([
			new Point(left , top),                  // top-left
			new Point(right, top),                  // top-right
			new Point(center.x + radius, center.y), // right
			new Point(right, bottom),               // bottom-right
			new Point(left , bottom),               // bottom-left
			new Point(center.x - radius, center.y)  // left
		]);
	}
});

declare( 'LibCanvas.Engines.HexProjection.Sizes', {

	initialize: function (projection, padding) {
		this.projection = projection;
		this.padding    = padding || 0;
		this.centers    = [];
	},

	_limits: null,

	/**
	 * @param {int[]} coordinates
	 * @return LibCanvas.Engines.HexProjection.Size
	 */
	add: function (coordinates) {
		this._limits = null;
		this.centers.push(this.projection.rgbToPoint( coordinates ));
		return this;
	},

	/** @return object */
	limits: function () {
		if (this._limits) return this._limits;

		var min, max, centers = this.centers, i = centers.length, c;

		while (i--) {
			c = centers[i];
			if (min == null) {
				min = c.clone();
				max = c.clone();
			} else {
				min.x = Math.min( min.x, c.x );
				min.y = Math.min( min.y, c.y );
				max.x = Math.max( max.x, c.x );
				max.y = Math.max( max.y, c.y );
			}
		}

		return this._limits = { min: min, max: max };
	},

	/** @return Size */
	size: function () {
		var
			limits   = this.limits(),
			settings = this.projection.settings,
			base     = settings.get('baseLength'),
			chord    = settings.get('chordLength'),
			height   = settings.get('hexHeight'),
			padding  = this.padding;

		return new Size(
			limits.max.x - limits.min.x + base    + 2 * (padding + chord),
			limits.max.y - limits.min.y + height  + 2 *  padding
		);
	},

	/** @return Point */
	center: function () {
		var
			min      = this.limits().min,
			settings = this.projection.settings,
			base     = settings.get('baseLength'),
			chord    = settings.get('chordLength'),
			height   = settings.get('hexHeight'),
			padding  = this.padding;

		return new Point(
			padding + base   /2 + chord - min.x,
			padding + height /2         - min.y
		);
	}


});

/*
---

name: "IsometricProjection"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point3D

provides: Engines.IsometricProjection

...
*/

/** @class IsometricProjection */
LibCanvas.declare( 'LibCanvas.Engines.IsometricProjection', 'IsometricProjection', {

	/**
	 * factor (and default factor in proto)
	 * @property {Point3D}
	 */
	factor: [0.866, 0.5, 0.866],

	/**
	 * size (and default size in proto)
	 * @property int
	 */
	size: 1,

	/**
	 * start (and default start in proto)
	 * @property {Point}
	 */
	start: [0, 0],

	/**
	 * @constructs
	 * @param {Point3D} factor
	 */

	/**
	 * @constructs
	 * @param {object} settings
	 * @param {Point3D} settings.factor
	 * @param {Point3D} settings.size
	 * @param {Point} settings.start - position of [0,0] coordinate
	 */
	initialize: function (settings) {
		this.bindMethods([ 'toIsometric', 'to3D' ]);
		this.settings = new Settings(settings);

		this.factor = Point3D( this.settings.get('factor') || this.factor );
		this.size   = Number ( this.settings.get('size')   || this.size   );
		this.start  = Point  ( this.settings.get('start')  || this.start  );
	},

	/**
	 * @param {Point3D} point3d
	 * @returns {Point}
	 */
	toIsometric: function (point3d) {
		point3d = Point3D( point3d );
		return new Point(
			(point3d.y + point3d.x) * this.factor.x,
			(point3d.y - point3d.x) * this.factor.y - point3d.z * this.factor.z
		)
		.mul(this.size)
		.move(this.start);
	},

	/**
	 * @param {Point} point
	 * @param {int} [z=0]
	 * @returns {Point3D}
	 */
	to3D: function (point, z) {
		point = Point(point);
		z = Number(z) || 0;

		var
			size  = this.size,
			start = this.start,
			dXY = ((point.y - start.y) / size + z * this.factor.z) / this.factor.y,
			pX  = ((point.x - start.x) / size / this.factor.x - dXY) / 2;

		return new Point3D( pX, pX + dXY, z );
	}
});

/*
 ---

 name: "Animation"

 description: ""

 license:
 - "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
 - "[MIT License](http://opensource.org/licenses/mit-license.php)"

 authors:
 - Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

 provides: Plugins.Animation

 requires:
 - LibCanvas

 ...
 */

/** @class Animation */
var Animation = LibCanvas.declare( 'LibCanvas.Plugins.Animation', 'Animation', {
	currentName : null,
	ownStartTime: null,
	timeoutId   : 0,
	synchronizedWith: null,

	initialize: function (settings) {
		this.bindMethods('update');

		this.events = new atom.Events(this);
		this.settings = new atom.Settings(settings).addEvents(this.events);
		this.run();
	},

	get sheet () {
		return this.settings.get('sheet');
	},

	set sheet (sheet) {
		return this.settings.set('sheet', sheet);
	},

	set startTime (time) {
		this.ownStartTime = time;
	},

	get startTime () {
		if (this.synchronizedWith) {
			return this.synchronizedWith.startTime;
		} else {
			return this.ownStartTime;
		}
	},

	stop: function () {
		this.startTime = null;
		return this.update();
	},

	run: function () {
		this.startTime = Date.now();
		return this.update();
	},

	synchronize: function (anim) {
		this.synchronizedWith = anim;
		return this;
	},

	get: function () {
		return this.sheet.get(this.startTime);
	},

	/** @private */
	update: function () {
		var delay = this.getDelay();

		clearTimeout(this.timeoutId);

		if (delay == null || this.startTime == null) {
			this.events.fire('stop');
		} else {
			this.events.fire('update', [ this.get() ]);
			this.timeoutId = setTimeout( this.update, delay );
		}
		return this;
	},

	/** @private */
	getDelay: function () {
		return this.startTime == null ? null :
			this.sheet.getCurrentDelay(this.startTime);
	}
});

/** @class Animation.Frames */
atom.declare( 'LibCanvas.Plugins.Animation.Frames', {
	sprites: [],

	initialize: function (image, width, height) {
		if (image  == null) throw new TypeError('`image` cant be null');

		this.sprites = [];
		this.image   = image;
		this.size    = new Size(
			width  == null ? image.width  : width ,
			height == null ? image.height : height
		);

		this.prepare();
	},

	get length () {
		return this.sprites.length;
	},

	/** @private */
	prepare: function () {
		var x, y,
			im = this.image,
			w  = this.size.width,
			h  = this.size.height;

		for     (y = 0; y <= im.height - h; y += h) {
			for (x = 0; x <= im.width  - w; x += w) {
				this.sprites.push( UtilsImage.sprite(im, new Rectangle(x, y, w, h)) );
			}
		}

		if (!this.sprites.length) {
			throw new TypeError('Animation is empty');
		}
	},

	get: function (id) {
		var sprite = this.sprites[id];

		if (!sprite) {
			throw new Error('No sprite with such id: ' + id);
		}

		return sprite;
	}
});

/** @class Animation.Sheet */
atom.declare( 'LibCanvas.Plugins.Animation.Sheet', {

	initialize: function (options) {
		this.frames   = options.frames;
		this.delay    = options.delay;
		this.looped   = options.looped;
		if (options.sequence == null) {
			this.sequence = atom.array.range(0, this.frames.length - 1);
		} else {
			this.sequence = options.sequence;
		}
	},

	get size () {
		return this.frames.size;
	},

	get: function (startTime) {
		if (startTime == null) return startTime;

		var id = this.getFrameId(this.countFrames(startTime));
		return id == null ? id : this.frames.get( id );
	},

	getCurrentDelay: function (startTime) {
		var frames, switchTime;

		frames = this.countFrames(startTime);

		if (this.getFrameId(frames) == null) {
			return null;
		}

		// когда был включён текущий кадр
		switchTime = frames * this.delay + startTime;

		// до следующего кадра - задержка минус время, которое показывается текущий
		return this.delay - ( Date.now() - switchTime );
	},

	/** @private */
	getFrameId: function (framesCount) {
		if (this.looped) {
			return this.sequence[ framesCount % this.sequence.length ];
		} else if (framesCount >= this.sequence.length) {
			return null;
		} else {
			return this.sequence[framesCount];
		}
	},

	/** @private */
	countFrames: function (startTime) {
		return Math.floor( (Date.now() - startTime) / this.delay );
	}

});

/**
 * @class
 * @name Animation.Image
 * @name LibCanvas.Plugins.Animation.Image
 */
atom.declare( 'LibCanvas.Plugins.Animation.Image', {
	initialize: function (animation) {
		this.bindMethods('update');

		if (animation instanceof Animation.Sheet) {
			animation = { sheet: animation };
		}
		if (!(animation instanceof Animation)) {
			animation = new Animation(animation);
		}

		this.buffer    = LibCanvas.buffer(animation.sheet.size, true);
		this.element   = atom.dom(this.buffer);
		this.animation = animation;
		this.element.controller = this;

		animation.events.add( 'update', this.update );
	},

	update: function (image) {
		this.buffer.ctx.clearAll();
		if (image) this.buffer.ctx.drawImage(image);
	}
}).own({
	element: function (animation) {
		return new this(animation).element;
	}
});

/*
 ---

 name: "Plugins.Curve"

 description: "Provides math base for bezier curves"

 license:
 - "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
 - "[MIT License](http://opensource.org/licenses/mit-license.php)"

 authors:
 - Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

 provides: Plugins.Curve

 requires:
 - LibCanvas
 - Point

 ...
 */

/** @name LibCanvas.Plugins.Curve */
atom.declare( 'LibCanvas.Plugins.Curve', {

	step: 0.0001,

	initialize: function (data) {
		this.from = data.from;
		this.to   = data.to;
		this.cp   = data.points;
	},

	getAngle: function (t) {
		var f;

		if (t < this.step) {
			f = t - this.step;
		} else {
			f  = t;
			t += this.step;
		}

		return this.getPoint(t).angleTo(this.getPoint(f));
	}

});

/** @name LibCanvas.Plugins.Curve.Quadratic */
atom.declare( 'LibCanvas.Plugins.Curve.Quadratic', LibCanvas.Plugins.Curve, {

	getPoint: function (t) {
		var
			from = this.from,
			to   = this.to,
			point= this.cp[0],
			i    = 1 - t;

		return new Point(
			i*i*from.x + 2*t*i*point.x + t*t*to.x,
			i*i*from.y + 2*t*i*point.y + t*t*to.y
		);
	}

});

/** @name LibCanvas.Plugins.Curve.Qubic */
atom.declare( 'LibCanvas.Plugins.Curve.Qubic', LibCanvas.Plugins.Curve, {

	getPoint: function (t) {
		var
			from = this.from,
			to   = this.to,
			cp   = this.cp,
			i    = 1 - t;

		return new Point(
			i*i*i*from.x + 3*t*i*i*cp[0].x + 3*t*t*i*cp[1].x + t*t*t*to.x,
			i*i*i*from.y + 3*t*i*i*cp[0].y + 3*t*t*i*cp[1].y + t*t*t*to.y
		);
	}

});

/*
---

name: "Plugins.ExtendedCurves"

description: "Curves with dynamic width and color"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Artem Smirnov <art543484@ya.ru>"
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Context2D

provides: Plugins.ExtendedCurves

...
*/

new function () {

// The following text contains bad code and due to it's code it should not be readed by ANYONE!

var
	Transition = atom.Transition,
	Color = atom.Color,
	EC = {};

/** @returns {atom.Color} */
EC.getColor = function (color) {
	return new Color(color || [0,0,0,1]);
};

EC.getPoints = function (prevPos, pos, width, inverted) {
	var
		w    = pos.x-prevPos.x,
		h    = pos.y-prevPos.y,
		dist = atom.math.hypotenuse(w, h),

		sin = h / dist,
		cos = w / dist,

		dx = sin * width,
		dy = cos * width;
		
	return [
		new Point(pos.x + dx, pos.y + dy*inverted),
		new Point(pos.x - dx, pos.y - dy*inverted)
	];
};

EC.getGradientFunction = function (attr) {
	switch (typeof attr.gradient) {
		case 'undefined' : 
			return atom.fn.lambda( EC.getColor(attr.color) );
		
		case 'function' :
			return attr.gradient;
		
		default :
			var gradient = { fn: attr.gradient.fn || 'linear' };
			
			if (typeof gradient.fn != 'string') {
				throw new Error('LibCanvas.Context2D.drawCurve -- unexpected type of gradient function');
			}
			
			gradient.from = EC.getColor(attr.gradient.from);
			gradient.to   = EC.getColor(attr.gradient.to  );
			
			var diff = gradient.from.diff( gradient.to );
			
			return function (t) {
				var factor = Transition.get(gradient.fn)(t);
				return gradient.from.shift( diff.clone().mul(factor) ).toString();
			};
	}
};

EC.getWidthFunction = function (attr) {
	attr.width = attr.width || 1;
	switch (typeof attr.width) {
		case 'number'  : return atom.fn.lambda(attr.width);
		case 'function': return attr.width;
		case 'object'  : return EC.getWidthFunction.range( attr.width );
		default: throw new TypeError('LibCanvas.Context2D.drawCurve -- unexpected type of width');
	}
};

EC.getWidthFunction.range = function (width) {
	if(!width.from || !width.to){
		throw new Error('LibCanvas.Context2D.drawCurve -- width.from or width.to undefined');
	}
	var diff = width.to - width.from;
	return function(t){
		return width.from + diff * Transition.get(width.fn || 'linear')(t);
	}
};

EC.curvesFunctions = [
	function (p, t) { // linear
		return {
			x:p[0].x + (p[1].x - p[0].x) * t,
			y:p[0].y + (p[1].y - p[0].y) * t
		};
	},
	function (p,t) { // quadratic
		var i = 1-t;
		return {
			x:i*i*p[0].x + 2*t*i*p[1].x + t*t*p[2].x,
			y:i*i*p[0].y + 2*t*i*p[1].y + t*t*p[2].y
		};
	},
	function (p, t) { // qubic
		var i = 1-t;
		return {
			x:i*i*i*p[0].x + 3*t*i*i*p[1].x + 3*t*t*i*p[2].x + t*t*t*p[3].x,
			y:i*i*i*p[0].y + 3*t*i*i*p[1].y + 3*t*t*i*p[2].y + t*t*t*p[3].y
		};
	}
];

Context2D.prototype.drawCurve = function (obj) {
	var points = atom.array.append( [Point(obj.from)], obj.points.map(Point), [Point(obj.to)] );

	var gradientFunction = EC.getGradientFunction(obj),             //Getting gradient function
		widthFunction    = EC.getWidthFunction(obj),                //Getting width function
		curveFunction    = EC.curvesFunctions[ obj.points.length ]; //Getting curve function

	if (!curveFunction) throw new Error('LibCanvas.Context2D.drawCurve -- unexpected number of points');

	var step = obj.step || 0.02;

	var invertedMultipler = obj.inverted ? 1 : -1;

	var controlPoint, prevContorolPoint,
		drawPoints  , prevDrawPoints   ,
		width , color, prevColor, style;

	prevContorolPoint = curveFunction(points, -step);

	for (var t=-step ; t<1.02 ; t += step) {
		controlPoint = curveFunction(points, t);
		color = gradientFunction(t);
		width = widthFunction(t) / 2;

		drawPoints = EC.getPoints(prevContorolPoint, controlPoint, width, invertedMultipler);

		if (t >= step) {
			// #todo: reduce is part of array, not color
			var diff = EC.getColor(prevColor).diff(color);

			if ( (diff.red + diff.green + diff.blue) > 150 ) {
				style = this.createLinearGradient(prevContorolPoint, controlPoint);
				style.addColorStop(0, prevColor);
				style.addColorStop(1,     color);
			} else {
				style = color;
			}

				this
					.set("lineWidth",1)
					.beginPath(prevDrawPoints[0])
					.lineTo   (prevDrawPoints[1])
					.lineTo   (drawPoints[1])
					.lineTo   (drawPoints[0])
					.fill  (style)
					.stroke(style);
		}
		prevDrawPoints    = drawPoints;
		prevContorolPoint = controlPoint;
		prevColor         = color;
	}
	return this;
};

};

/*
 ---

 name: "ImageBuilder"

 description: "Plugin, that compile image from parts"

 license:
 - "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
 - "[MIT License](http://opensource.org/licenses/mit-license.php)"

 authors:
 - Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

 provides: Plugins.ImageBuilder

 requires:
 - LibCanvas
 - Point
 - Rectangle

 ...
 */

/** @class ImageBuilder */
var ImageBuilder = LibCanvas.declare(
	'LibCanvas.Plugins.ImageBuilder', 'ImageBuilder', {
		ctx     : null,
		shape   : null,
		images  : [
			0, 1, 2,
			3, 4, 5,
			6, 7, 8
		],

		/**
		 * @param data
		 * @param data.source  - image
		 * @param data.widths  - [ left, center, right ]
		 * @param data.heights - [ top, middle, bottom ]
		 */
		initialize: function (data) {
			this.cropImage( data );
		},

		/** @private */
		renderSingle: function (image, xDir, yDir) {
			if (image != null) this.ctx.drawImage({
				image: image,
				from: this.countShape( xDir, yDir ).from
			});

			return this;
		},
		/** @private */
		renderRepeated: function (image, xDir, yDir) {
			if (image != null) {
				var pattern = this.ctx.createPattern( image, 'repeat' );

				var shape = this.countShape(xDir, yDir);
				this.ctx
					.translate(shape.from)
					.fill( new Rectangle(new Point(0,0), shape.size), pattern)
					.translate(shape.from, true);
			}
			return this;
		},
		/** @private */
		countShape: function (xDir, yDir) {
			var w, h,
				size = this.shape.size,
				from = new Point(0,0),
				to   = new Point(0,0);

			from.x = xDir == 'left'   ? 0 :
				this.countBasis( xDir == 'center' ? 'left' : 'right' );

			from.y = yDir == 'top'    ? 0 :
				this.countBasis( yDir == 'middle' ? 'top' : 'bottom' );

			to.x   = xDir == 'right'  ? size.width  :
				this.countBasis( xDir == 'center' ? 'right' : 'left' );

			to.y   = yDir == 'bottom' ? size.height :
				this.countBasis( yDir == 'middle' ? 'bottom' : 'top' );

			return new Rectangle( from, to ).move( this.shape );
		},
		/** @private */
		countBasis: function (basis) {
			var images = this.images, size = this.shape.size;

			switch (basis) {
				case 'left'  : return               images[0].width;
				case 'right' : return size.width  - images[2].width;
				case 'top'   : return               images[0].height;
				case 'bottom': return size.height - images[6].height;
				default: throw new TypeError('Wrong basis: ' + basis);
			}
		},
		/** @private */
		renderParts: function () {
			var images = this.images;
			this
				.renderRepeated( images[1], 'center', 'top'    )
				.renderRepeated( images[3], 'left'  , 'middle' )
				.renderRepeated( images[4], 'center', 'middle' )
				.renderRepeated( images[5], 'right' , 'middle' )
				.renderRepeated( images[7], 'center', 'bottom' )
				.renderSingle  ( images[0], 'left'  , 'top'    )
				.renderSingle  ( images[2], 'right' , 'top'    )
				.renderSingle  ( images[6], 'left'  , 'bottom' )
				.renderSingle  ( images[8], 'right' , 'bottom' );
		},
		/** @private */
		cropImage: function (data) {
			var w, h, x, y, width, height,
				images  = [],
				widths  = data.widths,
				heights = data.heights;

			for (y = 0, h = 0; h < heights.length; h++) {
				height = heights[h];
				for (x = 0, w = 0; w < widths.length; w++) {
					width = widths[w];

					images.push(this.createCroppedImage( data.source,
						new Rectangle(x,y,width,height)
					));

					x += width;
				}
				y += height;
			}

			this.images = images;
		},
		/** @private */
		createCroppedImage: function (source, shape) {
			var buffer = LibCanvas.buffer( shape.size, true );

			buffer.ctx.drawImage({
				image: source,
				draw : buffer.ctx.rectangle,
				crop : shape
			});

			return buffer;
		},

		renderTo: function (ctx, shape) {
			this.ctx   = ctx;
			this.shape = shape;
			this.renderParts();
		}
	}
);

/** @class ImageBuilder.Horisontal */
atom.declare( 'LibCanvas.Plugins.ImageBuilder.Horisontal', ImageBuilder, {
	images: [ 0, 1, 2 ],
	/** @private */
	countBasis: function (basis) {
		var images = this.images, size = this.shape.size;

		switch (basis) {
			case 'left'  : return images[0].width;
			case 'right' : return size.width  - images[2].width;
			case 'top'   : return 0;
			case 'bottom': return size.height;
			default: throw new TypeError('Wrong basis: ' + basis);
		}
	},
	/** @private */
	renderParts: function () {
		var images = this.images;
		this
			.renderRepeated( images[1], 'center', 'middle' )
			.renderSingle  ( images[0], 'left'  , 'middle' )
			.renderSingle  ( images[2], 'right' , 'middle' );
	},
	/** @private */
	cropImage: function (data) {
		var w, x, width,
			images  = [],
			widths  = data.widths;

		for (x = 0, w = 0; w < widths.length; w++) {
			width = widths[w];

			images.push(this.createCroppedImage( data.source,
				new Rectangle(x,0,width,data.source.height)
			));

			x += width;
		}

		this.images = images;
	}
});

/** @class ImageBuilder.Vertical */
atom.declare( 'LibCanvas.Plugins.ImageBuilder.Vertical', ImageBuilder, {
	images: [ 0, 1, 2 ],
	/** @private */
	countBasis: function (basis) {
		var images = this.images, size = this.shape.size;

		switch (basis) {
			case 'left'  : return 0;
			case 'right' : return size.width;
			case 'top'   : return images[0].height;
			case 'bottom': return size.height - images[2].height;
			default: throw new TypeError('Wrong basis: ' + basis);
		}
	},
	/** @private */
	renderParts: function () {
		var images = this.images;
		this
			.renderRepeated( images[1], 'center', 'middle' )
			.renderSingle  ( images[0], 'center', 'top'    )
			.renderSingle  ( images[2], 'center', 'bottom' );
	},
	/** @private */
	cropImage: function (data) {
		var h, y, height,
			images  = [],
			heights = data.heights;

		for (y = 0, h = 0; h < heights.length; h++) {
			height = heights[h];

			images.push(this.createCroppedImage( data.source,
				new Rectangle(0,y,data.source.width,height)
			));

			y += height;
		}

		this.images = images;
	}
});

/*
---

name: "Plugins.ProjectiveTexture"

description: "Provides testing projective textures rendering (more info: http://acko.net/files/projective/index.html)"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Context2D

provides: Plugins.ProjectiveTexture

source: "http://acko.net/blog/projective-texturing-with-canvas"

...
*/

var ProjectiveTexture = function () {

Context2D.prototype.projectiveImage = function (arg) {
	// test
	new ProjectiveTexture(arg.image)
		.setContext(this.ctx2d)
		.setQuality(arg.patchSize, arg.limit)
		.render( arg.to );
	return this;
};

var ProjectiveTexture = declare( 'LibCanvas.Plugins.ProjectiveTexture', {
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
	render : function (polygon) {

		var points = polygon.points;
		points = [
			[points[0].x, points[0].y],
			[points[1].x, points[1].y],
			[points[3].x, points[3].y],
			[points[2].x, points[2].y]
		];
		
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

return ProjectiveTexture;
}();

/*
 ---

 name: "SpriteFont"

 description: "Plugin, that render font from sprite"

 license:
 - "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
 - "[MIT License](http://opensource.org/licenses/mit-license.php)"

 authors:
 - Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

 provides: Plugins.SpriteFont

 requires:
 - LibCanvas

 ...
 */

/** @class SpriteFont */
var SpriteFont = LibCanvas.declare(
	'LibCanvas.Plugins.SpriteFont', 'SpriteFont',
	{
		initialize: function (symbols) {
			if (typeof symbols == 'string') {
				symbols = symbols.split('');
			}
			this.symbols = symbols;
			this.normal  = {};
			this.bold    = {};
		},

		make: function (sheet) {
			sheet = new SpriteFont.Sheet(this, sheet);

			var target = sheet.bold ? this.bold : this.normal;

			if (target[sheet.size]) {
				throw new TypeError('Size already exists');
			}

			target[sheet.size] = sheet;

			return sheet;
		},

		get: function (symbol, data) {
			var font = ( data.bold ? this.bold : this.normal )[ data.size ];
			if (font) {
				return font.get(symbol, data.color);
			} else {
				throw new Error('No such sheet in font');
			}
		}
	}
);

/** @class SpriteFont.Sheet */
atom.declare( 'LibCanvas.Plugins.SpriteFont.Sheet', {
	defaultColor: atom.Color.colorNames.black,

	settings: {
		image  : null,
		width  : [],
		symbols: [],
		bold   : false,
		size   : false
	},

	initialize: function (font, data) {
		this.settings = new atom.Settings(this.settings).set(data);
		this.symbols  = font.symbols;
		this.colors   = {};
		this.icons    = {};
	},

	get bold () { return this.settings.get('bold') },
	get size () { return this.settings.get('size') },

	get: function (symbol, color) {
		if (symbol in this.icons) {
			return this.icons[symbol];
		}

		if (!symbol in this.symbols) {
			throw new TypeError('Unknown symbol: ' + symbol);
		}
		if (color == null) {
			color = this.defaultColor;
		}
		color = atom.Color(color).toString('hex');

		var colors = this.colors;

		if (!colors[color]) {
			colors[color] = {};
		}
		if (!colors[color][symbol]) {
			colors[color][symbol] = this.generateSymbol(symbol, color);
		}

		return colors[color][symbol];
	},

	addIcon: atom.core.overloadSetter(function (name, image) {
		this.icons[name] = image;
	}),

	generateSymbol: function (symbol, color) {
		var i, w, h, x, img, buffer,
			width   = this.settings.get('width'),
			found   = false,
			symbols = this.symbols;

		for ( i = 0, x = 0; i < symbols.length; i++ ) {
			w = width[i];
			if (symbols[i] == symbol) {
				found = true;
				break;
			}
			x += w;
		}

		if (!found) {
			throw new Error('No symbol in list: ' + symbol);
		}

		img = this.settings.get('image');
		h   = img.height;
		buffer = LibCanvas.buffer(w, h, true);
		buffer.ctx.drawImage({
			image: img,
			crop : [ x, 0, w, h ],
			draw : buffer.ctx.rectangle
		});

		if (color != this.defaultColor) {
			buffer.ctx
				.save()
				.set({ globalCompositeOperation: Context2D.COMPOSITE.SOURCE_IN })
				.fillAll(color)
				.restore();

		}

		return buffer;
	}
});


/** @class SpriteFont.Render */
atom.declare( 'LibCanvas.Plugins.SpriteFont.Render', {

	/**
	 * @param {object}      ctx
	 * @param {object}      options
	 * @param {number}     [options.size=16]
	 * @param {boolean}    [options.bold=false]
	 * @param {boolean}    [options.tags=true]
	 * @param {string}     [options.text='']
	 * @param {SpriteFont}  options.font
	 * @param {Rectangle}   options.shape
	 * @param {string}     [options.align='left'] - 'left|middle|right'
	 */
	initialize: function (ctx, options) {
		this.ctx = ctx;
		this.options = atom.core.append({
			size : 16,
			bold : false,
			text : '',
			tags : '{*}',
			font : null,
			shape: null,
			color: 'black',
			align: 'left',
			lines: null,
			letterSpacing: 0
		}, options);

		var steps = new SpriteFont.Steps(this, new SpriteFont.Lexer(
			this.options.text, this.options.tags
		));

		steps.countSizes(this.options.font, this.options.letterSpacing);

		var lines = this.options.lines;
		if (!lines) lines = new SpriteFont.LinesEnRu( this.options.font );

		this.render( lines.run( steps.steps, this.options.shape.width ) );
	},

	render: function (lines) {
		var x, y, l, i, from = this.options.shape.from;

		for (l = 0, y = from.y; l < lines.length; l++) {
			for (i = 0, x = from.x; i < lines[l].length; i++) {
				this.ctx.drawImage( lines[l][i].image, x, y );
				x += lines[l][i].width;
			}
			y += lines[l].height;
		}
	}
});

/** @class SpriteFont.Steps */
atom.declare( 'LibCanvas.Plugins.SpriteFont.Steps', {
	tags: {
		bold : false,
		size : true,
		color: true
	},

	tagRegExp: /(\w+)(=.*)?/,

	initialize: function (render, lexer) {
		this.steps  = [];
		this.tokens = lexer.tokens;
		this.index  = -1;

		this.split(atom.object.collect(render.options, [ 'color', 'size', 'bold' ]));
	},

	split: function (initialMode) {
		var t,
			i = 0,
			l = this.tokens.length,
			stack = [ initialMode ],
			last  = function () {
				return stack[ stack.length - 1 ];
			};

		for (; i < l; i++) {
			t = this.tokens[i];
			if (t.type == 'string') {
				t.content.split('').forEach(function (l) {
					this.steps.push({ type: 'symbol', content: l, mode: last() });
				}.bind(this));
			} else if (t.type == 'nl') {
				this.steps.push(t);
			} else if (t.type == 'tag') {
				if (this.isCloseModeTag(t)) {
					stack.pop();
				} else if (this.isChangeModeTag(t)) {
					stack.push(this.createMode(t, last()));
				} else {
					this.steps.push({ type: 'icon', content: t.content, mode: last() });
				}
			} else {
				throw new Error('Unknown type: ' + t.type);
			}
		}
	},

	isChangeModeTag: function (t) {
		return t.content.match( this.tagRegExp )[1] in this.tags;
	},

	isCloseModeTag: function (t) {
		return t.content == '/';
	},

	createMode: function (t, currentMode) {
		var
			parts = t.content.match( this.tagRegExp ),
			tag   = parts[1],
			value = parts[2],
			mode  = atom.core.append({}, currentMode);

		if (this.tags[tag]) {
			if (value) value = value.substr(1);
			if (value == '') throw new Error('Value required in tag ' + tag);
		} else {
			value = true;
		}

		mode[tag] = value;
		return mode;
	},

	countSizes: function (font, letterSpacing) {
		var i, s, img;
		for (i = 0; i < this.steps.length; i++) {
			s = this.steps[i];
			if (s.type == 'symbol' || s.type == 'icon') {
				img = font.get( s.content, s.mode );
				s.image  = img;
				s.width  = img.width + letterSpacing;
				s.height = img.height;
			}
		}
	}
});

/** @class SpriteFont.Lexer */
atom.declare( 'LibCanvas.Plugins.SpriteFont.Lexer', {

	initialize: function (string, tags) {
		this.string = string;
		this.tags   = this.parseTags(tags);
		this.tokens = this.tokenize();
	},

	tokenize: function () {
		var t = this.tags, s = this.string;
		return t ?
			this.parseTaggedText(s, t) :
			this.parsePlainText (s);
	},

	parseTaggedText: function (string, tags) {
		var
			i = 0,
			last,
			symbol = '',
			result = [],
			length = string.length,
			startTag = false;

		for (; i < length; i++) {
			symbol = string[i];
			if (symbol == '\n') {
				if (last && last.type == 'tag') {
					throw new Error('Tag started, but not finished at symbol ' + i);
				}
				result.push({ type: 'nl' });
				last = null;
			} else if (symbol == tags[0]) {
				if (last && last.type == 'tag') {
					throw new Error('Wrong tag opening at symbol ' + i);
				}
				result.push(last = { type: 'tag'   , content: '' });
			} else if (!last) {
				result.push(last = { type: 'string', content: string[i] });
			} else if (symbol == tags[1] && last.type == 'tag') {
				last = null;
			} else {
				last.content += string[i];
			}
		}

		return result;
	},

	parsePlainText: function (string) {
		var
			i = 0,
			last,
			result = [],
			length = string.length;
		for (; i < length; i++) {
			if (string[i] == '\n') {
				last = null;
				result.push({ type: 'nl' });
			} else if (!last) {
				last = { type: 'string', content: string[i] };
				result.push(last);
			} else {
				last.content += string[i];
			}
		}
		return result;
	},

	parseTags: function (tags) {
		if (tags == null) return null;

		function wrong (part) {
			throw new TypeError('String like "[*]" required (' + part + ')');
		}

		if (typeof tags != 'string') wrong('typeof');

		tags = tags.split('*');

		if (tags   .length != 2) wrong('split');
		if (tags[0].length != 1) wrong('left' );
		if (tags[1].length != 1) wrong('right');

		return tags;
	}
});


/** @class SpriteFont.LinesEnRu */
atom.declare( 'LibCanvas.Plugins.SpriteFont.LinesEnRu', {
	vowels: 'AEIOUYaeiouyАОУЮИЫЕЭЯЁаоуюиыеэяёьЄІЇЎєіїў',

	initialize: function (font) {
		this.font = font;
	},

	run: function (steps, maxWidth) {

		var i, line = [], morphemes = [];
		for (i = 0; i < steps.length; i++) {
			if (steps[i].type == 'nl' || i == steps.length - 1) {
				morphemes.push( this.findMorphemes(line) );
				line = [];
			} else {
				line.push(steps[i]);
			}
		}

		return this.countLines(morphemes, maxWidth);

	},

	countLines: function (mLines, maxWidth) {
		var lines = [], l, i, line = [], width = 0, mWidth;

		function add (data) {
			if (!Array.isArray(data)) data = [ data ];
			for (var i = 0; i < data.length; i++) {
				line.push(data[i]);
				width += data[i].width;
			}
		}

		for (l = 0; l < mLines.length; l++) {
			for (i = 0; i < mLines[l].length; i++) {
				mWidth = this.countLength(mLines[l][i]);

				if (mWidth > maxWidth) {
					throw new Error('Morpheme too long');
				}

				if (width + mWidth > maxWidth || (i == 0 && l > 0)) {
					lines.push(line);
					line  = [];
					width = 0;
				}

				add(mLines[l][i]);
			}
		}

		lines.forEach(function (l) {
			l.height = 0;

			l.forEach(function (obj) {
				l.height = Math.max( l.height, obj.height );
			});
		});

		return lines;
	},

	countLength: function (m) {
		if (Array.isArray(m)) {
			return atom.array.reduce(
				m, function (value, sym) { return value + sym.width }, 0
			);
		} else {
			return m.width;
		}
	},

	isLetter: function(str) {
		return (str >= 'a' && str <= 'z') || (str >= 'A' && str <= 'я') ||
		       (str >= 'A' && str <= 'Z') || (str >= '\u00c0' && str <= '\u02a8') ||
		       (str >= '0' && str <= '9') || (str >= '\u0386' && str <= '\u04ff');
	},

	isVowel: function(str) {
		return str && str.length == 1 && this.vowels.indexOf(str) > -1;
	},

	isMorpheme: function (str) {
		if (!str || str.length <= 1) return false;

		for (var i = str.length; i--;) if (this.isVowel(str[i])) return true;

		return false;
	},

	findMorphemes: function (line) {
		var i = 0, c, morphemes = [], lastStr = '', last = [], prev;

		for (; i < line.length; i++) {
			c = line[i].content;
			if (line[i].type == 'symbol' && this.isLetter(c)) {
				lastStr += c;
				last.push(line[i]);
				if (this.isMorpheme(lastStr)) {
					morphemes.push(last);
					last = [];
					lastStr = '';
				}
			} else if (lastStr) {
				prev = morphemes[ morphemes.length - 1 ];
				if (Array.isArray(prev)) {
					atom.array.append( prev, last );
				} else {
					morphemes.push(last);
				}
				last = [];
				lastStr = '';

				if (!this.isLetter(c)) {
					morphemes.push( line[i] );
				}
			} else {
				morphemes.push( line[i] );
			}
		}

		return morphemes;
	}
});

/*
---

name: "Shapes.Ellipse"

description: "Provides ellipse as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shapes.Rectangle

provides: Shapes.Ellipse

...
*/

/** @class Ellipse */
var Ellipse = LibCanvas.declare( 'LibCanvas.Shapes.Ellipse', 'Ellipse', Rectangle, {
	set: function () {
		this.bindMethods( 'update' );
		Rectangle.prototype.set.apply(this, arguments);
	},
	_angle : 0,
	get angle () {
		return this._angle;
	},
	set angle (a) {
		if (this._angle == a) return;
		this._angle = atom.math.normalizeAngle(a);
		this.updateCache = true;
	},
	update: function () {
		this.updateCache = true;
	},
	rotate : function (degree) {
		this.angle += degree;
		return this;
	},
	hasPoint : function () {
		var ctx = this.processPath( shapeTestBuffer().ctx );
		return ctx.isPointInPath(Point(arguments));
	},
	cache : null,
	updateCache : true,
	countCache : function () {
		if (this.cache && !this.updateCache) {
			return this.cache;
		}

		if (this.cache === null) {
			this.cache = [];
			for (var i = 12; i--;) this.cache.push(new Point());
		}
		var c = this.cache,
			angle = this._angle,
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
	equals : function (shape, accuracy) {
		return Rectangle.prototype.equals.call( this, shape, accuracy ) && shape.angle == this.angle;
	},
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	},
	dump: function (name) {
		return Rectangle.prototype.dump.call(this, name || 'Ellipse');
	}
});

/*
---

name: "Shapes.Line"

description: "Provides line as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Line

...
*/

var Line = function () {

var between = function (x, a, b, accuracy) {
	return atom.number.equals(x, a, accuracy)
		|| atom.number.equals(x, b, accuracy)
		|| (a < x && x < b)
		|| (b < x && x < a);
};

var halfPi = Math.PI/2;

/** @class Line */
return LibCanvas.declare( 'LibCanvas.Shapes.Line', 'Line', Shape, {
	set : function (from, to) {
		var a = atom.array.pickFrom(arguments);

		if (a.length === 4) {
			this.from = new Point( a[0], a[1] );
			this.to   = new Point( a[2], a[3] );
		} else {
			this.from = Point(a[0] || a.from);
			this.to   = Point(a[1] || a.to);
		}

		return this;
	},
	hasPoint : function (point) {
		var fx = this.from.x,
			fy = this.from.y,
			tx = this.to.x,
			ty = this.to.y,
			px = point.x,
			py = point.y;

		if (!( atom.number.between(point.x, Math.min(fx, tx), Math.max(fx, tx))
		    && atom.number.between(point.y, Math.min(fy, ty), Math.max(fy, ty))
		)) return false;

		// if triangle square is zero - points are on one line
		return atom.number.round(((fx-px)*(ty-py)-(tx-px)*(fy-py)), 6) == 0;
	},
	getBoundingRectangle: function () {
		return new Rectangle(this.from, this.to).fillToPixel().grow(2);
	},
	intersect: function (line, point, accuracy) {
		if (line.constructor != this.constructor) {
			return this.getBoundingRectangle().intersect( line );
		}
		var a = this.from, b = this.to, c = line.from, d = line.to, x, y, FALSE = point ? null : false;
		if (atom.number.equals(d.x, c.x, accuracy)) { // DC == vertical line
			if (atom.number.equals(b.x, a.x, accuracy)) {
				if (atom.number.equals(a.x, d.x, accuracy)) {
					if (atom.number.between(a.y, c.y, d.y)) {
						return a.clone();
					} else if (atom.number.between(b.y, c.y, d.y)) {
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

		if (!between(x, a.x, b.x, accuracy)) return FALSE;
		if (!between(y, a.y, b.y, accuracy)) return FALSE;
		if (!between(x, c.x, d.x, accuracy)) return FALSE;
		if (!between(y, c.y, d.y, accuracy)) return FALSE;

		return point ? new Point(x, y) : true;
	},
	perpendicular: function (point) {
		point = Point( point );
		var
			fX = this.from.x,
			fY = this.from.y,
			tX = this.to.x,
			tY = this.to.y,
			pX = point.x,
			pY = point.y,
			dX = (tX-fX) * (tX-fX),
			dY = (tY-fY) * (tY-fY),
			rX = ((tX-fX)*(tY-fY)*(pY-fY)+fX*dY+pX*dX) / (dX+dY),
			rY = (tY-fY)*(rX-fX)/(tX-fX)+fY;

		return new Point( rX, rY );
	},
	distanceTo: function (p, asInfiniteLine) {
		p = Point(p);
		var f = this.from, t = this.to, angle, s, x, y;

		if (!asInfiniteLine) {
			angle = Math.atan2(p.x - t.x, p.y - t.y);
			if ( atom.number.between(angle, -halfPi, halfPi) ) {
				return t.distanceTo( p );
			}

			angle = Math.atan2(f.x - p.x, f.y - p.y);
			if ( atom.number.between(angle, -halfPi, halfPi) ) {
				return f.distanceTo( p );
			}
		}

		s = Math.abs(
			f.x * (t.y - p.y) +
			t.x * (p.y - f.y) +
			p.x * (f.y - t.y)
		) / 2;

		x = f.x - t.x;
		y = f.y - t.y;
		return 2 * s / Math.sqrt(x*x+y*y);
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
		return Shape.prototype.dump.call(this, 'Line');
	}
});

}();


/*
---

name: "Shapes.Path"

description: "Provides Path as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Path

...
*/

/** @class Path */
var Path = LibCanvas.declare( 'LibCanvas.Shapes.Path', 'Path', Shape, {
	getCoords: null,
	builder  : null,
	set : function (builder) {
		this.builder = builder;
		builder.path = this;
		return this;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		this.each(function (method, args) {
			ctx[method].apply(ctx, args);
		});
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	intersect: function (obj) {
		return this.getBoundingRectangle( obj ).intersect( this.getBoundingRectangle() );
	},
	each: function (fn) {
		this.builder.parts.forEach(function (part) {
			fn.call( this, part.method, part.args );
		}.bind(this));
		return this;
	},
	get allPoints () {
		var points = [];
		this.each(function (method, args) {
			if (method == 'arc') {
				atom.array.include(points, args[0].circle.center);
			} else for (var i = 0, l = args.length; i < l; i++) {
				atom.array.include(points, args[i]);
			}
		});
		return points;
	},
	get center () {
		return new Point().mean(this.allPoints);
	},
	hasPoint : function (point) {
		var ctx = shapeTestBuffer().ctx;
		if (this.builder.changed) {
			this.builder.changed = false;
			this.processPath(ctx);
		}
		return ctx.isPointInPath(Point(arguments));
	},
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	},
	move : function (distance, reverse) {
		this.builder.changed = true;

		atom.array.invoke( this.allPoints, 'move', distance, reverse );
		return this;
	},
	scale: function (power, pivot) {
		this.builder.changed = true;

		atom.array.invoke( this.allPoints, 'scale', power, pivot );
		return this;
	},
	grow: function () {
		return this;
	},
	rotate: function (angle, pivot) {
		this.builder.changed = true;

		atom.array.invoke( this.allPoints, 'rotate', angle, pivot );

		this.each(function (method, args) {
			if (method == 'arc') {
				var a = args[0].angle;
				a.start = atom.math.normalizeAngle(a.start + angle);
				a.end   = atom.math.normalizeAngle(a.end   + angle);
			}
		}.bind(this));
		return this;
	},
	// #todo: fix arc, cache
	getBoundingRectangle: function () {
		var p = this.allPoints, from, to;
		if (p.length == 0) throw new Error('Is empty');

		from = p[0].clone(), to = p[0].clone();
		for (var l = p.length; l--;) {
			from.x = Math.min( from.x, p[l].x );
			from.y = Math.min( from.y, p[l].y );
			  to.x = Math.max(   to.x, p[l].x );
			  to.y = Math.max(   to.y, p[l].y );
		}
		return new Rectangle( from, to );
	},
	clone: function () {
		var builder = new Path.Builder;
		atom.core.append( builder.parts, this.builder.parts.clone() );
		return builder.build();
	}
});

/** @class Path.Builder */
declare( 'LibCanvas.Shapes.Path.Builder', {
	initialize: function (str) {
		this.update = this.update.bind( this );
		this.parts  = [];
		if (str) this.parse( str );
	},
	update: function () {
		this.changed = true;
		return this;
	},
	build : function (str) {
		if ( str != null ) this.parse(str);
		if ( !this.path  ) this.path = new Path(this);

		return this.path;
	},
	snapToPixel: function () {
		this.parts.forEach(function (part) {
			var a = part.args;
			if (part.method == 'arc') {
				a[0].circle.center.snapToPixel();
			} else {
				atom.array.invoke( a, 'snapToPixel' );
			}
		});
		return this;
	},

	// queue/stack
	changed : true,
	push : function (method, args) {
		this.parts.push({ method : method, args : args });
		return this.update();
	},
	unshift: function (method, args) {
		this.parts.unshift({ method : method, args : args });
		return this.update();
	},
	pop : function () {
		this.parts.pop();
		return this.update();
	},
	shift: function () {
		this.parts.shift();
		return this.update();
	},

	// methods
	move : function () {
		return this.push('moveTo', [ Point(arguments) ]);
	},
	line : function () {
		return this.push('lineTo', [ Point(arguments) ]);
	},
	curve : function (to, p1, p2) {
		var args = atom.array.pickFrom(arguments);

		if (args.length == 6) {
			args = [
				[ args[0], args[1] ],
				[ args[2], args[3] ],
				[ args[4], args[5] ]
			];
		} else if (args.length == 4){
			args = [
				[ args[0], args[1] ],
				[ args[2], args[3] ]
			];
		}

		return this.push('curveTo', args.map( Point ));
	},
	arc : function (circle, angle, acw) {
		var a = atom.array.pickFrom(arguments);

		if (a.length >= 6) {
			a = {
				circle : [ a[0], a[1], a[2] ],
				angle : [ a[3], a[4] ],
				acw : a[5]
			};
		} else if (a.length > 1) {
			a.circle = circle;
			a.angle  = angle;
			a.acw    = acw;
		} else if (circle instanceof Circle) {
			a = { circle: circle, angle: [0, Math.PI * 2] };
		} else {
			a = a[0];
		}

		a.circle = Circle(a.circle);

		if (Array.isArray(a.angle)) {
			a.angle = {
				start : a.angle[0],
				end   : a.angle[1]
			};
		}

		Point( a.circle.center );

		a.acw = !!(a.acw || a.anticlockwise);
		return this.push('arc', [a]);
	},

	// stringing
	stringify : function (sep) {
		if (!sep) sep = ' ';
		var p = function (p) { return sep + p.x.toFixed(2) + sep + p.y.toFixed(2); };
		return this.parts.map(function (part) {
			var a = part.args[0];
			switch(part.method) {
				case 'moveTo' : return 'M' + p(a);
				case 'lineTo' : return 'L' + p(a);
				case 'curveTo': return 'C' + part.args.map(p).join('');
				case 'arc'    : return 'A' +
					p( a.circle.center ) + sep + a.circle.radius.toFixed(2) + sep +
					a.angle.start.toFixed(2) + sep + a.angle.end.toFixed(2) + sep + (a.acw ? 1 : 0);
			}
		}).join(sep);
	},

	parse : function (string) {
		var parts = string.split(/[ ,|]/), full  = [];

		parts.forEach(function (part) {
			if (!part.length) return;

			if (isNaN(part)) {
				full.push({ method : part, args : [] });
			} else if (full.length) {
				full[full.length-1].args.push( Number(part) );
			}
		});

		full.forEach(function (p) {
			var method = { M : 'move', L: 'line', C: 'curve', A: 'arc' }[p.method];
			return this[method].apply(this, p.args);
		}.bind(this));

		return this;
	}
});

/*
---

name: "Shapes.Polygon"

description: "Provides user-defined concave polygon as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape
	- Shapes.Line

provides: Shapes.Polygon

...
*/

/** @class Polygon */
var Polygon = LibCanvas.declare( 'LibCanvas.Shapes.Polygon', 'Polygon', Shape, {
	initialize: function () {
		this.points = [];
		this._lines = [];
		Shape.prototype.initialize.apply(this, arguments);
	},
	set : function (poly) {
		this.points.length = 0;
		atom.array.append( this.points,
			atom.array.clean(
				atom.array
					.pickFrom(arguments)
					.map(function (elem) { if (elem) return Point(elem) })
			)
		);
		this._lines.length = 0;
		return this;
	},
	get length () {
		return this.points.length;
	},
	get lines () {
		var lines = this._lines, p = this.points, l = p.length, i = 0;
		if (lines.length != l) for (;i < l; i++) {
			lines.push( new Line( p[i], i+1 == l ? p[0] : p[i+1] ) );
		}
		return this._lines;
	},
	get center () {
		return new Point().mean(this.points);
	},
	get: function (index) {
		return this.points[index];
	},
	hasPoint : function (point) {
		point = Point(atom.array.pickFrom(arguments));

		var result = false, points = this.points;
		for (var i = 0, l = this.length; i < l; i++) {
			var k = (i || l) - 1, I = points[i], K = points[k];
			if (
				(atom.number.between(point.y, I.y , K.y, "L")
				|| atom.number.between(point.y, K.y , I.y, "L")
				) && point.x < (K.x - I.x) * (point.y -I.y) / (K.y - I.y) + I.x
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
		atom.array.invoke( this.points, 'move', distance, reverse);
		return this;
	},
	grow: function () {
		return this;
	},
	getBoundingRectangle: function () {
		var p = this.points, from, to;
		if (p.length == 0) throw new Error('Polygon is empty');

		from = p[0].clone(), to = p[0].clone();
		for (var l = p.length; l--;) {
			from.x = Math.min( from.x, p[l].x );
			from.y = Math.min( from.y, p[l].y );
			  to.x = Math.max(   to.x, p[l].x );
			  to.y = Math.max(   to.y, p[l].y );
		}
		return new Rectangle( from, to );
	},
	rotate : function (angle, pivot) {
		atom.array.invoke( this.points, 'rotate', angle, pivot );
		return this;
	},
	scale : function (power, pivot) {
		atom.array.invoke( this.points, 'scale', power, pivot );
		return this;
	},
	// #todo: cache
	intersect : function (poly) {
		if (poly.constructor != this.constructor) {
			return this.getBoundingRectangle().intersect( poly );
		}
		var tL = this.lines, pL = poly.lines, i = tL.length, k = pL.length;
		while (i-- > 0) for (k = pL.length; k-- > 0;) {
			if (tL[i].intersect(pL[k])) return true;
		}
		return false;
	},
	each : function (fn, context) {
		return this.points.forEach(context ? fn.bind(context) : fn);
	},

	getPoints : function () {
		return atom.array.toHash(this.points);
	},
	clone: function () {
		return new this.constructor( atom.array.invoke(this.points, 'clone') );
	}
});

/*
---

name: "Shapes.RoundedRectangle"

description: "Provides rounded rectangle as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Shapes.Rectangle

provides: Shapes.RoundedRectangle

...
*/

/** @class RoundedRectangle */
var RoundedRectangle = LibCanvas.declare(
	'LibCanvas.Shapes.RoundedRectangle', 'RoundedRectangle', Rectangle, {
		radius: 0,

		setRadius: function (value) {
			this.radius = value;
			return this;
		},
		draw : Shape.prototype.draw,
		processPath : function (ctx, noWrap) {
			var from = this.from, to = this.to, radius = this.radius;
			if (!noWrap) ctx.beginPath();
			ctx
				.moveTo (from.x, from.y+radius)
				.lineTo (from.x,   to.y-radius)
				.curveTo(from.x, to.y, from.x + radius, to.y)
				.lineTo (to.x-radius, to.y)
				.curveTo(to.x,to.y, to.x,to.y-radius)
				.lineTo (to.x, from.y+radius)
				.curveTo(to.x, from.y, to.x-radius, from.y)
				.lineTo (from.x+radius, from.y)
				.curveTo(from.x,from.y,from.x,from.y+radius);
			if (!noWrap) ctx.closePath();
			return ctx;
		},

		equals: function (shape, accuracy) {
			return Rectangle.prototype.equals.call( this, shape, accuracy ) && shape.radius == this.radius;
		},

		dump: function () {
			var p = function (p) { return '[' + p.x + ', ' + p.y + ']'; };
			return '[shape RoundedRectangle(from'+p(this.from)+', to'+p(this.to)+', radius='+this.radius+')]';
		}
});

/*
---

name: "Utils.Image"

description: "Provides some Image extensions"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Shapes.Rectangle

provides: Utils.Image

...
*/

var UtilsImage = atom.declare( 'LibCanvas.Utils.Image', {
	canvasCache: null,

	initialize: function (image) {
		this.image = image;
		this.cache = {};
	},

	/**
	 * @param {Rectangle} rect
	 * #todo: use createPattern
	 */
	createSprite: function (rect) {
		var image, buf, xShift, yShift, x, y, xMax, yMax, crop, size, current, from, to;

		if (rect.width <= 0 || rect.height <= 0) {
			throw new TypeError('Wrong rectangle size');
		}

		image = this.image;
		buf = LibCanvas.buffer(rect.width, rect.height, true);

		// если координаты выходят за левый/верхний край картинки
		if (rect.from.x < 0) xShift = Math.ceil(Math.abs(rect.from.x) / rect.width );
		if (rect.from.y < 0) yShift = Math.ceil(Math.abs(rect.from.y) / rect.height);
		if (xShift || yShift) {
			rect = rect.clone().move(new Point(
				xShift * image.width,
				yShift * image.height
			));
		}

		// для того, чтобы была возможность указывать ректангл, выходящий
		// за пределы картинки. текущая картинка повторяется как паттерн
		xMax = Math.ceil(rect.to.x / image.width );
		yMax = Math.ceil(rect.to.y / image.height);
		for (y = yMax; y-- > 0;) for (x = xMax; x-- > 0;) {
			current = new Point(x * image.width, y * image.height);
			from = current.clone();
			to   = from.clone().move([image.width, image.height]);

			if (from.x < rect.from.x) from.x = rect.from.x;
			if (from.y < rect.from.y) from.y = rect.from.y;
			if (  to.x > rect. to .x)   to.x = rect. to .x;
			if (  to.y > rect. to .y)   to.y = rect. to .y;

			crop = new Rectangle(from, to);
			size = crop.size;
			crop.from.x %= image.width;
			crop.from.y %= image.height;
			crop.size    = size;

			if (x) current.x -= rect.from.x;
			if (y) current.y -= rect.from.y;

			if (size.width && size.height) buf.ctx.drawImage({
				image : image,
				crop  : crop,
				draw  : new Rectangle( current, size )
			});
		}

		return buf;
	},

	toCanvas: function () {
		var cache = this.canvasCache;

		if (!cache) {
			cache = this.canvasCache = LibCanvas.buffer(this, true);
			cache.ctx.drawImage(this);
		}
		return cache;
	},

	isLoaded: function () {
		return this.constructor.isLoaded( this.image );
	},

	sprite: function () {
		if (!this.isLoaded()) throw new Error('Not loaded in Image.sprite, logged');

		if (arguments.length) {
			var
				rect  = Rectangle(arguments),
				index = rect.dump(),
				cache = this.cache[index];

			if (!cache) {
				cache = this.cache[index] = this.createSprite(rect);
			}
			return cache;
		} else {
			return this.toCanvas();
		}
	}
});
UtilsImage.own({
	isLoaded : function (image) {
		return image.complete && ( (image.naturalWidth == null) || !!image.naturalWidth );
	},

	sprite: function (image, rectangle) {
		return this.mix(image).sprite(rectangle);
	},

	toCanvas: function (image) {
		return this.mix(image).toCanvas();
	},

	mix: function (image) {
		var key = 'libcanvas.image';

		if (!image[key]) {
			image[key] = new this(image);
		}

		return image[key];
	}
});

/*
---

name: "Utils.ImagePrototype"

description: "Provides some Image extensions"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Utils.Image

provides: Utils.ImagePrototype

...
*/

// <image> tag
atom.core.append(HTMLImageElement.prototype, {
	createSprite: function (rect) {
		return UtilsImage.mix(this).createSprite(rect);
	},
	toCanvas: function () {
		return UtilsImage.mix(this).toCanvas();
	},
	sprite : function () {
		var utils = UtilsImage.mix(this);

		return utils.sprite.apply( utils, arguments );
	},
	isLoaded : function () {
		return UtilsImage.isLoaded(this);
	}
});

// mixin from image
atom.core.append(HTMLCanvasElement.prototype, {
	createSprite : HTMLImageElement.prototype.createSprite,
	sprite   : HTMLImageElement.prototype.sprite,
	isLoaded : atom.fn.lambda(true),
	toCanvas : atom.fn.lambda()
});

/*
---

name: "App.Light"

description: "LibCanvas.App.Light"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.Light

...
*/

/** @class App.Light */
declare( 'LibCanvas.App.Light', {

	initialize: function (size, settings) {
		var mouse, mouseHandler;

		this.settings = new Settings({
			size    : Size(size),
			name    : 'main',
			mouse   : true,
			invoke  : false,
			appendTo: 'body',
			intersection: 'auto'
		}).set(settings || {});
		this.app   = new App( this.settings.get(['size', 'appendTo']) );
		this.scene = this.app.createScene(this.settings.get(['name','invoke','intersection']));
		if (this.settings.get('mouse') === true) {
			mouse = new Mouse(this.app.container.bounds);
			mouseHandler = new App.MouseHandler({ mouse: mouse, app: this.app });

			this.app.resources.set({ mouse: mouse, mouseHandler: mouseHandler });
		}
	},

	createVector: function (shape, settings) {
		settings = atom.core.append({ shape:shape }, settings || {});

		return new App.Light.Vector(this.scene, settings);
	},

	createText: function (shape, style, settings) {
		settings = atom.core.append({ shape: shape, style: style }, settings);
		return new App.Light.Text(this.scene, settings);
	},

	get mouse () {
		return this.app.resources.get( 'mouse' );
	}

});

/*
---

name: "App.Light.Text"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App
	- App.Light

provides: App.Light.Text

...
*/

/** @class App.Light.Text */
atom.declare( 'LibCanvas.App.Light.Text', {
	parent: App.Element,

	prototype: {
		get content () {
			return this.settings.get('content') || '';
		},

		set content (c) {
			if (Array.isArray(c)) c = c.join('\n');
			
			if (c != this.content) {
				this.redraw();
				this.settings.set('content', String(c) || '');
			}
		},

		renderTo: function (ctx) {
			var
				style = this.settings.get('style') || {},
				bg    = this.settings.get('background');
			ctx.save();
			if (bg) ctx.fill( this.shape, bg );
			ctx.text(atom.core.append({
				text: this.content,
				to  : this.shape
			}, style));
			ctx.restore();
		}
	}
});

/*
---

name: "App.Light.Vector"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App
	- App.Light

provides: App.Light.Vector

...
*/

/** @class App.Light.Vector */
App.Light.Vector = atom.declare( 'LibCanvas.App.Light.Vector', {
	parent: App.Element,

	prototype: {
		configure: function () {
			var behaviors = this.settings.get('behaviors');

			this.style       = {};
			this.styleActive = {};
			this.styleHover  = {};
			
			this.animate = new atom.Animatable(this).animate;
			this.behaviors = new Behaviors(this);
			this.behaviors.add('Draggable', this.redraw);
			this.behaviors.add('Clickable', this.redraw);
			if (this.settings.get('mouse') !== false) {
				this.listenMouse();
			}
		},

		get mouse () {
			return this.scene.app.resources.get( 'mouse' );
		},

		move: function (point) {
			this.shape.move(point);
			this.redraw();
		},

		setStyle: function (key, values) {
			if (typeof key == 'object') {
				values = key;
				key = '';
			}
			key = 'style' + atom.string.ucfirst(key);

			atom.core.append( this[key], values );
			return this.redraw();
		},

		getStyle: function (type) {
			if (!this.style) return null;

			var
				active = (this.active || null) && this.styleActive[type],
				hover  = (this.hover || null)  && this.styleHover [type],
				plain  = this.style[type];

			return active != null ? active :
			       hover  != null ? hover  :
			       plain  != null ? plain  : null;
		},

		/**
		 * Override by Animatable method
		 */
		animate: function(){},

		listenMouse: function (unsubscribe) {
			var method = unsubscribe ? 'unsubscribe' : 'subscribe';
			return this.scene.app.resources.get('mouseHandler')[method](this);
		},

		destroy: function () {
			this.listenMouse(true);
			return App.Element.prototype.destroy.call(this);
		},

		get currentBoundingShape () {
			var
				br = this.shape.getBoundingRectangle(),
				lw = this.getStyle('stroke') && (this.getStyle('lineWidth') || 1);

			return lw ? br.fillToPixel().grow(2 * Math.ceil(lw)) : br;
		},

		renderTo: function (ctx) {
			var fill    = this.getStyle('fill'),
			    stroke  = this.getStyle('stroke'),
			    lineW   = this.getStyle('lineWidth'),
			    opacity = this.getStyle('opacity');

			if (opacity === 0) return this;
			
			ctx.save();
			if (opacity) ctx.globalAlpha = atom.number.round(opacity, 3);
			if (fill) ctx.fill(this.shape, fill);
			if (stroke ) {
				ctx.lineWidth = lineW || 1;
				ctx.stroke(this.shape, stroke);
			}
			ctx.restore();
			return this;
		}
	}
});

/*
---

name: "Tile Engine"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Size
	- Rectangle

provides: Engines.Tile

...
*/

/** @class TileEngine */
LibCanvas.declare( 'LibCanvas.Engines.Tile', 'TileEngine', {

	/**
	 * @param {Object} settings
	 * @param {*} settings.defaultValue
	 * @param {Size} settings.size
	 * @param {Size} settings.cellSize
	 * @param {Size} settings.cellMargin
	 */
	initialize: function (settings) {
		this.cells    = [];
		this.methods  = {};
		this.cellsUpdate = [];

		this.events   = new Events(this);
		this.settings = new Settings(settings).addEvents(this.events);

		this.createMatrix();
	},

	setMethod: atom.core.overloadSetter(function (name, method) {
		var type = typeof method;

		if (type != 'function' && type != 'string' && !atom.dom.isElement(method)) {
			throw new TypeError( 'Unknown method: «' + method + '»' );
		}

		this.methods[ name ] = method;
	}),

	countSize: function () {
		var
			settings   = this.settings,
			cellSize   = settings.get('cellSize'),
			cellMargin = settings.get('cellMargin');

		return new Size(
			(cellSize.x + cellMargin.x) * this.width  - cellMargin.x,
			(cellSize.y + cellMargin.y) * this.height - cellMargin.y
		);
	},

	getCellByIndex: function (point) {
		return this.isIndexOutOfBounds(point) ? null:
			this.cells[ this.width * point.y + point.x ];
	},

	getCellByPoint: function (point) {
		var
			settings   = this.settings,
			cellSize   = settings.get('cellSize'),
			cellMargin = settings.get('cellMargin');

		return this.getCellByIndex(new Point(
			parseInt(point.x / (cellSize.width  + cellMargin.x)),
			parseInt(point.y / (cellSize.height + cellMargin.y))
		));
	},

	refresh: function (ctx, translate) {
		if (this.requireUpdate) {
			ctx.save();
			if (translate) ctx.translate(translate);
			atom.array.invoke( this.cellsUpdate, 'renderTo', ctx );
			ctx.restore();
			this.cellsUpdate.length = 0;
		}
		return this;
	},

	get width () {
		return this.settings.get('size').width;
	},

	get height () {
		return this.settings.get('size').height;
	},

	get requireUpdate () {
		return !!this.cellsUpdate.length;
	},

	/** @private */
	createMatrix : function () {
		var x, y, cell, point, shape,
			settings   = this.settings,
			size       = settings.get('size'),
			value      = settings.get('defaultValue'),
			cellSize   = settings.get('cellSize'),
			cellMargin = settings.get('cellMargin');

		for (y = 0; y < size.height; y++) for (x = 0; x < size.width; x++) {
			point = new Point(x, y);
			shape = this.createCellRectangle(point, cellSize, cellMargin);
			cell  = new LibCanvas.Engines.Tile.Cell( this, point, shape, value );

			this.cells.push( cell );
		}
		return this;
	},

	/** @private */
	createCellRectangle: function (point, cellSize, cellMargin) {
		return new Rectangle({
			from: new Point(
				(cellSize.x + cellMargin.x) * point.x,
				(cellSize.y + cellMargin.y) * point.y
			),
			size: cellSize
		});
	},

	/** @private */
	isIndexOutOfBounds: function (point) {
		return point.x < 0 || point.y < 0 || point.x >= this.width || point.y >= this.height;
	},

	/** @private */
	updateCell: function (cell) {
		if (!this.requireUpdate) {
			this.events.fire('update', [ this ]);
		}
		atom.array.include( this.cellsUpdate, cell );
		return this;
	}

});

/*
---

name: "Tile Engine Cell"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Engines.Tile

provides: Engines.Tile.Cell

...
*/
/** @class TileEngine.Cell */
declare( 'LibCanvas.Engines.Tile.Cell', {

	initialize: function (engine, point, rectangle, value) {
		this.engine = engine;
		this.point  = point;
		this.value  = value;
		this.rectangle = rectangle;
	},

	/** @private */
	_value: null,

	get value () {
		return this._value;
	},

	set value (value) {
		this._value = value;
		this.engine.updateCell(this);
	},

	renderTo: function (ctx) {
		var method, value = this.value, rectangle = this.rectangle;

		ctx.clear( rectangle );

		if (value == null) return this;

		method = this.engine.methods[ value ];

		if (method == null) {
			throw new Error( 'No method in tile engine: «' + this.value + '»')
		}

		if (atom.dom.isElement(method)) {
			ctx.drawImage( method, rectangle );
		} else if (typeof method == 'function') {
			method.call( this, ctx, this );
		} else {
			ctx.fill( rectangle, method );
		}
		return this;
	}

});

/*
---

name: "Tile Engine App Element"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Engines.Tile
	- App.Element

provides: Engines.Tile.Element

...
*/
/** @class TileEngine.Element */
declare( 'LibCanvas.Engines.Tile.Element', App.Element, {
	configure: function () {
		this.shape = new Rectangle(
			this.settings.get('from'),
			this.engine.countSize()
		);
		this.engine.events.add( 'update', this.redraw );
	},

	get engine () {
		return this.settings.get('engine');
	},

	clearPrevious: function () {},

	renderTo: function (ctx) {
		this.engine.refresh(ctx, this.shape.from);
	}
}).own({
	app: function (app, engine, from) {
		return new this( app.createScene({
			intersection: 'manual',
			invoke: false
		}), {
			engine: engine,
			from: from || new Point(0, 0)
		});
	}
});



/*
---

name: "Tile Engine App Element Mouse Handler"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Engines.Tile.Element

provides: Engines.Tile.Mouse

...
*/
/** @class TileEngine.Mouse */
declare( 'LibCanvas.Engines.Tile.Mouse', {
	initialize: function (element, mouse) {
		var handler = this;

		handler.mouse    = mouse;
		handler.element  = element;
		handler.events   = new Events(handler);
		handler.previous = null;
		handler.lastDown = null;

		element.events.add({
			mousemove: function () {
				var cell = handler.get();
				if (handler.previous != cell) {
					handler.outCell();
					handler.fire( 'over', cell );
					handler.previous = cell;
				}
			},
			mouseout: function () {
				handler.outCell();
			},
			mousedown: function () {
				var cell = handler.get();
				handler.fire( 'down', cell );
				handler.lastDown = cell;
			},
			mouseup: function () {
				var cell = handler.get();
				handler.fire( 'up', cell );
				if (cell != null && cell == handler.lastDown) {
					handler.fire( 'click', cell );
				}
				handler.lastDown = null;
			},
			contextmenu: function () {
				var cell = handler.get();
				if (cell != null) {
					handler.fire( 'contextmenu', cell );
				}
			}
		});
	},

	/** @private */
	get: function () {
		return this.element.engine.getCellByPoint(
			this.mouse.point.clone().move(this.element.shape.from, true)
		);
	},

	/** @private */
	fire: function (event, cell) {
		return this.events.fire( event, [ cell, this ]);
	},

	/** @private */
	outCell: function () {
		if (this.previous) {
			this.fire( 'out', this.previous );
			this.previous = null;
		}
	}
});

}).call(typeof window == 'undefined' ? exports : window, atom, Math);