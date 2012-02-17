
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

var LibCanvas = this.LibCanvas = declare({
	name: 'LibCanvas',

	own: {
		Buffer: function () {
			return LibCanvas.buffer.apply( LibCanvas, arguments );
		},
		buffer: function (width, height, withCtx) {
			var size, a = slice.call(arguments), last = a[a.length-1];

			withCtx = (typeof last === 'boolean' ? a.pop() : false);

			size = Size(a.length == 1 ? a[0] : a);
			
			var canvas = atom.dom.create("canvas", {
				width  : size.width,
				height : size.height
			}).first;
			
			if (withCtx) canvas.ctx = canvas.getContext('2d-libcanvas');
			return canvas;
		},
		extract: function (to) {
			to = to || global;
			for (var k in LibCanvas.Shapes) {
				to[k] = LibCanvas.Shapes[k];
			}
			if (typeof ImagePreloader != 'undefined') {
				to.ImagePreloader = ImagePreloader;
			}
			if (typeof App != 'undefined') {
				to.App = App;
			}
			to.Point = Point;
			to.Size  = Size;
			return to;
		}
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


var App = declare( 'LibCanvas.App', {
	initialize: function (settings) {
		this.bindMethods( 'tick' );

		this.scenes    = [];
		this.settings  = new Settings(settings);
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

/** @private */
App.Container = declare( 'LibCanvas.App.Container', {
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

App.Element = declare( 'LibCanvas.App.Element', {

	zIndex: 0,

	/** @constructs */
	initialize: function (scene, settings) {
		this.bindMethods( 'redraw' );

		this.events = new Events(this);
		this.settings = new Settings({ hidden: false })
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
		return this.shape.getBoundingRectangle();
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
			shape.fillToPixel() : shape.clone().grow( 2 );
		return this;
	},

	renderTo: function (ctx, resources) {
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

App.ElementsMouseSearch = declare( 'LibCanvas.App.ElementsMouseSearch', {

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


App.Layer = declare( 'LibCanvas.App.Layer', {
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

App.MouseHandler = declare( 'LibCanvas.App.MouseHandler', {

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


		[ 'down', 'up', 'move', 'out', 'dblclick', 'contextmenu', 'wheel' ]
			.forEach(function (type) {
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
			if (!elements.contains(elem)) {
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

App.Scene = declare( 'LibCanvas.App.Scene', {

	initialize: function (app, settings) {
		this.settings = new Settings({
			invoke      : app.settings.get('invoke'),
			intersection: 'auto' // 'auto'|'manual'
		}).set(settings);

		this.app      = app;
		this.elements = [];
		this.redraw   = [];
		this.createLayer();
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
			ctx   = this.layer.canvas.ctx,
			resources = this.app.resources,
			redraw    = this.redraw;

		if (this.settings.get('intersection') === 'auto') {
			this.addIntersections();
		}

		// draw elements with the lower zIndex first
		atom.array.sortBy( redraw, 'zIndex' );

		for (i = redraw.length; i--;) {
			redraw[i].clearPrevious( ctx, resources );
		}

		for (i = redraw.length; i--;) {
			elem = redraw[i];
			if (elem.scene == this && elem.isVisible()) {
				elem.renderTo( ctx, resources );
				elem.redrawRequested = false;
				elem.saveCurrentBoundingShape();
			}
		}

		redraw.length = 0;
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
			this.redrawElement ( element );
			this.elements.erase( element );
			element.scene = null;
		}
		return this;
	},

	/** @private */
	redrawElement: function (element) {
		if (element.scene == this && !element.redrawRequested) {
			this.redraw.push( element );
			this.needUpdate = true;
			element.redrawRequested = true;
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
		var i = this.elements.length, e;
		while (i--) {
			e = this.elements[i];
			// check if we need also `e.currentBoundingShape.intersect( shape )`
			if (e != elem && e.isVisible() && e.previousBoundingShape.intersect( shape )) {
				fn.call( this, e );
			}
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

App.SceneShift = declare( 'LibCanvas.App.SceneShift', {

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
			shift.x = shift.x.limit(limit.from.x - current.x, limit.to.x - current.x);
			shift.y = shift.y.limit(limit.from.y - current.y, limit.to.y - current.y);
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

var Behaviors = declare( 'LibCanvas.Behaviors', {
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


var Behavior = declare( 'LibCanvas.Behaviors.Behavior',
{

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

return declare( 'LibCanvas.Behaviors.Clickable', {

	parent: Behavior,

	own: { index: 'clickable' },

	prototype: {
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
	}
});

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

declare( 'LibCanvas.Behaviors.Draggable', {

	parent: Behavior,

	own: { index: 'draggable' },

	prototype: {
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
	}
});

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

var Geometry = declare( 'LibCanvas.Geometry',
/**
 * @lends LibCanvas.Geometry.prototype
 * @augments Class.Events.prototype
 */
{
	own: {
		invoke: declare.castArguments,
		from : function (obj) {
			return this(obj);
		}
	},
	proto: {
		initialize : function () {
			if (arguments.length) this.set.apply(this, arguments);
		},
		cast: function (args) {
			return this.constructor.castArguments(args);
		}
	}
});

/*
---

name: "Utils.Math"

description: "Helpers for basic math operations, such as degree, hypotenuse from two cathetus, etc"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

provides: Utils.Math

...
*/

// Number
(function () {

	var degreesCache = {}, d360;

	atom.core.append(Number.prototype, {
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

	degreesCache = [0, 45, 90, 135, 180, 225, 270, 315, 360]
		.associate(function (num) {
			return num.degree();
		});
	d360 = degreesCache[360];

})();

atom.core.append(Math, {
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

var Point = function () {

var Point = declare( 'LibCanvas.Point', {
	parent: Geometry,

	prototype: {
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
			return Math.atan2(diff.y, diff.x).normalizeAngle();
		},
		/** @returns {Number} */
		distanceTo : function (point) {
			var diff = this.cast(point).diff(this);
			return Math.hypotenuse(diff.x, diff.y);
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
			return this.x.equals(to.x, accuracy) && this.y.equals(to.y, accuracy);
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
			this.x += 0.5 - (this.x - this.x.floor());
			this.y += 0.5 - (this.y - this.y.floor());
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

return Point;

}();

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
var Size = declare( 'LibCanvas.Size', {
	parent: Point,

	prototype: {
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

var Shape = declare( 'LibCanvas.Shape',
/**
 * @lends LibCanvas.Shape.prototype
 * @augments LibCanvas.Geometry.prototype
 */
{
	parent : Geometry,
	proto  : {
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

var Rectangle = declare( 'LibCanvas.Shapes.Rectangle', {
	parent: Shape,
	proto: {
		set : function () {
			var a = Array.pickFrom(arguments);

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
						sizeX = (as ? [as.w, as[0], as.width ] : [ a.w, a.width  ]).pick(),
						sizeY = (as ? [as.h, as[1], as.height] : [ a.h, a.height ]).pick();
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
			this.to.moveTo({ x : this.from.x + width, y : this.to.y });
		},
		set height (height) {
			this.to.moveTo({ x : this.to.x, y : this.from.y + height });
		},
		get size () {
			return {
				width : this.width,
				height: this.height
			};
		},
		set size (size) {
			if (size.width != this.width || size.height != this.height) {
				this.to.moveTo([ this.from.x + size.width, this.from.y + size.height ]);
			}
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
		/** @returns {boolean} */
		hasPoint : function (point, padding) {
			point   = Point(arguments);
			padding = padding || 0;
			return point.x != null && point.y != null
				&& point.x.between(Math.min(this.from.x, this.to.x) + padding, Math.max(this.from.x, this.to.x) - padding, 1)
				&& point.y.between(Math.min(this.from.y, this.to.y) + padding, Math.max(this.from.y, this.to.y) - padding, 1);
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
				this.width .abs(),
				this.height.abs()
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
				Number.random(margin, this.width  - margin),
				Number.random(margin, this.height - margin)
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

var Circle = declare( 'LibCanvas.Shapes.Circle',
/** @lends {Circle#} */
{
	parent: Shape,
	proto: {
		set : function () {
			var a = Array.pickFrom(arguments);

			if (a.length >= 3) {
				this.center = new Point(a[0], a[1]);
				this.radius = a[2];
			} else if (a.length == 2) {
				this.center = Point(a[0]);
				this.radius = a[1];
			} else {
				a = a[0];
				this.radius = [a.r, a.radius].pick();
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
					angle  : [0, (360).degree()]
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

atom.append(HTMLCanvasElement,
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

atom.append(HTMLCanvasElement.prototype,
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

/* In some Mobile browsers shadowY should be inverted (bug) */
var shadowBug = function () {
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

var Context2D = declare( 'LibCanvas.Context2D',
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
	own: constants,

	proto: {
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
			var a = Array.pickFrom(arguments), circle, angle, acw;
			if (a.length > 1) {
				return this.original('arc', a);
			} else if ('circle' in a[0]) {
				circle = Circle(a[0].circle);
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
				p  = Array.from( arguments ).map(Point);
				to = p.shift()
			} else {
				p  = Array.from( curve.points ).map(Point);
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
				a = a.length == 2 ? a.associate(['p', 'to']) : a[0];
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

			cfg = atom.append({
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
			var lh = (cfg.lineHeight || (cfg.size * 1.15)).round();
			this.set('font', '{style}{weight}{size}px {family}'
				.substitute({
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
					from = { x: from.x.round(), y: from.y.round() }
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
						x: (size.width  - a.image.width ).abs(),
						y: (size.height - a.image.height).abs()
					};
					from = { x: draw.from.x.round(), y: draw.from.y.round() };
					if (dSize.x <= 1.1 && dSize.y <= 1.1 ) {
						this.original('drawImage', [ a.image, from.x, from.y ]);
					} else {
						this.original('drawImage', [
							a.image, from.x, from.y, size.width.round(), size.height.round()
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

			var args = Array.pickFrom(arguments);
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
				args.append([rect.from.x, rect.from.y, rect.width, rect.height])
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
		/** @returns {CanvasGradient} */
		drawWindow : function () {
			return this.original('drawWindow', arguments);
		},
		/** @returns {string} */
		toString: Function.lambda('[object LibCanvas.Context2D]')
		// Such moz* methods wasn't duplicated:
		// mozTextStyle, mozDrawText, mozMeasureText, mozPathText, mozTextAlongPath
	}
});


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

HTMLCanvasElement.addContext('2d-libcanvas', Context2D);

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


var Mouse = new function () {

function eventSource (e) {
	return e.changedTouches ? e.changedTouches[0] : e;
}

return declare( 'LibCanvas.Mouse', {
	own: {
		expandEvent: function (e) {
			var source = eventSource(e);

			if (e.pageX == null) {
				e.pageX = source.pageX != null ? source.pageX : source.clientX + document.scrollLeft;
				e.pageY = source.pageY != null ? source.pageY : source.clientY + document.scrollTop ;
			}

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
				mousewheel    : callback,
				selectstart   : false
			});
		}
	}
});

};

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

var Point3D = declare( 'LibCanvas.Point3D',
/** @lends Point3D# */
{
	parent: Geometry,

	prototype: {
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

provides: Shapes.Polygon

...
*/

declare( 'LibCanvas.Engines.HexProjection', {
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

declare( 'LibCanvas.Engines.IsometricProjection', {

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

/*
	The following text contains bad code and due to it's code it should not be readed by ANYONE!
*/

var
	Transition = atom.Transition,
	Color = atom.Color,
	Point = LibCanvas.Point,
	EC    = {};

/** @returns {atom.Color} */
EC.getColor = function (color) {
	return new Color(color || [0,0,0,1]);
};

EC.getPoints = function (prevPos, pos, width, inverted) {
	var
		w    = pos.x-prevPos.x,
		h    = pos.y-prevPos.y,
		dist = Math.hypotenuse(w, h),

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
	var points = [Point(obj.from)].append( obj.points.map(Point), [Point(obj.to)] );

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

var Ellipse = declare( 'LibCanvas.Shapes.Ellipse', {
	parent: Rectangle,
	proto: {
		set : function () {
			this.bindMethods( 'update' );
			Rectangle.prototype.set.apply(this, arguments);
		},
		_angle : 0,
		get angle () {
			return this._angle;
		},
		set angle (a) {
			if (this._angle == a) return;
			this._angle = a.normalizeAngle();
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
	return x.equals(a, accuracy) || x.equals(b, accuracy) || (a < x && x < b) || (b < x && x < a);
};

return declare( 'LibCanvas.Shapes.Line', {
	parent: Shape,
	proto: {
		set : function (from, to) {
			var a = Array.pickFrom(arguments);

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

			if (!( point.x.between(Math.min(fx, tx), Math.max(fx, tx))
			    && point.y.between(Math.min(fy, ty), Math.max(fy, ty))
			)) return false;

			// if triangle square is zero - points are on one line
			return ((fx-px)*(ty-py)-(tx-px)*(fy-py)).round(6) == 0;
		},
		getBoundingRectangle: function () {
			return new Rectangle(this.from, this.to).fillToPixel().grow(2);
		},
		intersect: function (line, point, accuracy) {
			if (line.constructor != this.constructor) {
				return this.getBoundingRectangle().intersect( line );
			}
			var a = this.from, b = this.to, c = line.from, d = line.to, x, y, FALSE = point ? null : false;
			if (d.x.equals(c.x, accuracy)) { // DC == vertical line
				if (b.x.equals(a.x, accuracy)) {
					if (a.x.equals(d.x, accuracy)) {
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
			var f = this.from, t = this.to, degree, s, x, y;

			if (!asInfiniteLine) {
				degree = Math.atan2(p.x - t.x, p.y - t.y).getDegree();
				if ( degree.between(-90, 90) ) {
					return t.distanceTo( p );
				}

				degree = Math.atan2(f.x - p.x, f.y - p.y).getDegree();
				if ( degree.between(-90, 90) ) {
					return f.distanceTo( p );
				}
			}

			s = (
				f.x * (t.y - p.y) +
				t.x * (p.y - f.y) +
				p.x * (f.y - t.y)
			).abs() / 2;

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
var Path = declare( 'LibCanvas.Shapes.Path',
/** @lends {LibCanvas.Shapes.Path.prototype} */
{
	parent: Shape,

	proto: {
		getCoords: null,
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
					points.include(args[0].circle.center);
				} else for (var i = 0, l = args.length; i < l; i++) {
					points.include(args[i]);
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

			this.allPoints.invoke( 'move', distance, reverse );
			return this;
		},
		scale: function (power, pivot) {
			this.builder.changed = true;

			this.allPoints.invoke( 'scale', power, pivot );
			return this;
		},
		grow: function () {
			return this;
		},
		rotate: function (angle, pivot) {
			this.builder.changed = true;

			this.allPoints.invoke( 'rotate', angle, pivot );

			this.each(function (method, args) {
				if (method == 'arc') {
					var a = args[0].angle;
					a.start = (a.start + angle).normalizeAngle();
					a.end   = (a.end   + angle).normalizeAngle();
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
			builder.parts.append( this.builder.parts.clone() );
			return builder.build();
		}
	}
});

Path.Builder = declare( 'LibCanvas.Shapes.Path.Builder', {
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
				a.invoke('snapToPixel');
			}
		});
		return this;
	},
	/** @deprecated */
	listenPoint: function (p) {
		return Point( p );
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
		return this.push('moveTo', [ this.listenPoint(arguments) ]);
	},
	line : function () {
		return this.push('lineTo', [ this.listenPoint(arguments) ]);
	},
	curve : function (to, p1, p2) {
		var args = Array.pickFrom(arguments);

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

		return this.push('curveTo', args.map( this.listenPoint.bind( this ) ));
	},
	arc : function (circle, angle, acw) {
		var a = Array.pickFrom(arguments);

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
			a = { circle: circle, angle: [0, (360).degree()] };
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

		this.listenPoint( a.circle.center );

		a.acw = !!(a.acw || a.anticlockwise);
		return this.push('arc', [a]);
	},

	// stringing
	stringify : function (sep) {
		if (!sep) sep = ' ';
		var p = function (p) { return sep + p.x.round(2) + sep + p.y.round(2); };
		return this.parts.map(function (part) {
			var a = part.args[0];
			switch(part.method) {
				case 'moveTo' : return 'M' + p(a);
				case 'lineTo' : return 'L' + p(a);
				case 'curveTo': return 'C' + part.args.map(p).join('');
				case 'arc'    : return 'A' +
					p( a.circle.center ) + sep + a.circle.radius.round(2) + sep +
					a.angle.start.round(2) + sep + a.angle.end.round(2) + sep + (a.acw ? 1 : 0);
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
				full.last.args.push( Number(part) );
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

var Polygon = declare( 'LibCanvas.Shapes.Polygon', {
	parent: Shape,
	proto: {
		initialize: function () {
			this.points = [];
			this._lines = [];
			Shape.prototype.initialize.apply(this, arguments);
		},
		set : function (poly) {
			this.points.empty().append(
				Array.pickFrom(arguments)
					.map(function (elem) {
						if (elem) return Point(elem);
					})
					.clean()
			);
			this._lines.empty();
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
			point = Point(Array.pickFrom(arguments));

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
			this.points.invoke('move', distance, reverse);
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
			this.points.invoke('rotate', angle, pivot);
			return this;
		},
		scale : function (power, pivot) {
			this.points.invoke('scale', power, pivot);
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
			return Array.toHash(this.points);
		},
		clone: function () {
			return new this.constructor(this.points.invoke('clone'));
		}
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

var RoundedRectangle = declare( 'LibCanvas.Shapes.RoundedRectangle', {
	parent: Rectangle,

	proto: {
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
// <image> tag
atom.append(HTMLImageElement.prototype, {
	// наверное, лучше использовать createPattern
	createSprite: function (rect) {
		if (rect.width <= 0 || rect.height <= 0) {
			throw new TypeError('Wrong rectangle size');
		}

		var buf = LibCanvas.buffer(rect.width, rect.height, true),
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

			if (size.width && size.height) buf.ctx.drawImage({
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
			var rect  = Rectangle(arguments),
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
		return (this.naturalWidth == null) || !!this.naturalWidth;
	}
});
	// mixin from image
atom.append(HTMLCanvasElement.prototype, {
	createSprite : HTMLImageElement.prototype.createSprite,
	sprite   : HTMLImageElement.prototype.sprite,
	isLoaded : function () { return true; },
	toCanvas : function () { return this; }
});

/*
---

name: "Utils.ImagePreloader"

description: "Provides images preloader"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Shapes.Rectangle

provides: Utils.ImagePreloader

...
*/

var ImagePreloader = declare( 'LibCanvas.Utils.ImagePreloader', {
	processed : 0,
	number    : 0,
	
	initialize: function (settings) {
		this.events   = new Events(this);
		this.settings = new Settings(settings).addEvents(this.events);

		this.count = {
			error: 0,
			abort: 0,
			load : 0
		};
		
		this.suffix    = this.settings.get('suffix') || '';
		this.usrImages = this.prefixImages(this.settings.get('images'));
		this.domImages = this.createDomImages();
		this.images    = {};
	},
	get isReady () {
		return this.number == this.processed;
	},
	get info () {
		var stat = atom.string.substitute(
			"Images loaded: {load}; Errors: {error}; Aborts: {abort}",
			this.count
		);
		if (this.isReady) stat = "Image preloading has completed;\n" + stat;
		return stat;
	},
	get progress () {
		return this.isReady ? 1 : atom.number.round(this.processed / this.number, 4);
	},
	exists: function (name) {
		return !!this.images[name];
	},
	get: function (name) {
		var image = this.images[name];
		if (image) {
			return image;
		} else {
			throw new Error('No image «' + name + '»');
		}
	},

	/** @private */
	prefixImages: function (images) {
		var prefix = this.settings.get('prefix');
		if (!prefix) return images;

		return Object.map(images, function (src) {
			if(src.begins('http://') || src.begins('https://') ) {
				return src;
			}
			return prefix + src;
		});
	},
	/** @private */
	cutImages: function () {
		var i, parts, img;
		for (i in this.usrImages) {
			parts = this.splitUrl( this.usrImages[i] );
			img   = this.domImages[ parts.url ];
			if (parts.coords) img = img.sprite(new Rectangle( parts.coords ));
			this.images[i] = img;
		}
		return this;
	},
	/** @private */
	splitUrl: function (str) {
		var url = str, size, cell, match, coords = null;

				// searching for pattern 'url [x:y:w:y]'
		if (match = str.match(/ \[(\d+)\:(\d+)\:(\d+)\:(\d+)\]$/)) {
			coords = match.slice( 1 );
				// searching for pattern 'url [w:y]{x:y}'
		} else if (match = str.match(/ \[(\d+)\:(\d+)\]\{(\d+)\:(\d+)\}$/)) {
			coords = match.slice( 1 ).map( Number );
			size = coords.slice( 0, 2 );
			cell = coords.slice( 2, 4 );
			coords = [ cell[0] * size[0], cell[1] * size[1], size[0], size[1] ];
		}
		if (match) {
			url = str.substr(0, str.lastIndexOf(match[0]));
			coords = coords.map( Number );
		}
		if (this.suffix) {
			if (typeof this.suffix == 'function') {
				url = this.suffix( url );
			} else {
				url += this.suffix;
			}
		}

		return { url: url, coords: coords };
	},
	/** @private */
	createDomImages: function () {
		var i, result = {}, url, images = this.usrImages;
		for (i in images) {
			url = this.splitUrl( images[i] ).url;
			if (!result[url]) result[url] = this.createDomImage( url );
		}
		return result;
	},
	/** @private */
	createDomImage : function (src) {
		var img = new Image();
		img.src = src;
		if (window.opera && img.complete) {
			setTimeout(this.onProcessed.bind(this, 'load', img), 10);
		} else {
			['load', 'error', 'abort'].forEach(function (event) {
				img.addEventListener( event, this.onProcessed.bind(this, event, img), false );
			}.bind(this));
		}
		this.number++;
		return img;
	},
	/** @private */
	onProcessed : function (type, img) {
		if (type == 'load' && window.opera) {
			// opera fullscreen bug workaround
			img.width  = img.width;
			img.height = img.height;
			img.naturalWidth  = img.naturalWidth;
			img.naturalHeight = img.naturalHeight;
		}
		this.count[type]++;
		this.processed++;
		if (this.isReady) this.cutImages().events.ready('ready', [this]);
		return this;
	}
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

App.Light = declare( 'LibCanvas.App.Light', {

	initialize: function (size, settings) {
		var mouse, mouseHandler;

		this.settings = new Settings({
			size    : Size(size),
			name    : 'main',
			mouse   : true,
			invoke  : false,
			appendTo: 'body'
		}).set(settings || {});
		this.app   = new App( this.settings.get(['size', 'appendTo']) );
		this.scene = this.app.createScene(this.settings.get(['name','invoke']));
		if (this.settings.get('mouse') === true) {
			mouse = new Mouse(this.app.container.bounds);
			mouseHandler = new App.MouseHandler({ mouse: mouse, app: this.app });

			this.app.resources.set({ mouse: mouse, mouseHandler: mouseHandler });
		}
	},

	createVector: function (shape, settings) {
		settings = atom.append({ shape:shape }, settings || {});

		return new App.Light.Vector(this.scene, settings);
	},

	createText: function (shape, style, settings) {
		settings = atom.append({ shape: shape, style: style }, settings);
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


App.Light.Text = atom.declare( 'LibCanvas.App.Light.Text', {
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

}).call(typeof window == 'undefined' ? exports : window, atom, Math);