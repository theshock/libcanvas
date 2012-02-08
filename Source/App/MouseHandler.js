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

		handler.app   = handler.settings.get('app');
		handler.mouse = handler.settings.get('mouse');
		handler.compareFunction = function (left, right) {
			return handler.app.zIndexCompare(left, right, true);
		};


		[ 'down', 'up', 'move', 'out', 'dblclick', 'contextmenu', 'wheel' ].forEach(function (type) {
			handler.mouse.events.add( type, function (e) {
				handler.event(type, e, false);
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
		atom.array.include(this.subscribers, elem);
		return this;
	},

	unsubscribe : function (elem) {
		atom.array.erase(this.subscribers, elem);
		return this;
	},

	fall: function () {
		var value = this.falling;
		this.falling = false;
		return value;
	},

	isOver: function (elem) {
		return this.mouse.inside && elem.hasMousePoint( this.mouse.point );
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
	event: function (type, e, stopped) {
		if (this.stopped) return;

		var method = ['dblclick', 'contextmenu', 'wheel'].indexOf( type ) >= 0
			? 'forceEvent' : 'parseEvent';
		
		return this[method]( type, e, stopped, this.subscribers );
	},

	/** @private */
	parseEvent: function (type, event, stopped, elements) {
		if (type == 'down') this.lastMouseDown.length = 0;

		var i, elem,
			handler  = this,
			lastDown = handler.lastMouseDown,
			lastMove = handler.lastMouseMove,
			lastOut  = [],
			eventArgs = [event];

		var fire = function (eventName) {
			var children = this.childrenElements;
			if (children && children.length) {
				handler.parseEvent(type, event, stopped, children);
			}
			this.events.fire( eventName, eventArgs );
		};

		try {
			elements.sort( this.compareFunction );
		} catch (e) {
			throw new Error('Element binded to mouse, but without scene, check elements');
		}

		// В первую очередь - обрабатываем реальный mouseout с элементов
		if (type == 'move' || type == 'out') {
			for (i = lastMove.length; i--;) {
				elem = lastMove[i];
				if (elements.contains(elem) && !handler.isOver(elem)) {
					fire.call( elem, 'mouseout' );
					lastMove.erase(elem);
					lastOut.push(elem);
				}
			}
		}

		for (i = elements.length; i--;) {
			elem = elements[i];
			// предыдущий элемент принял "удар" на себя
			// необходимо сообщить остальным элементам о mouseout
			if (stopped) {
				if (type == 'move' || type == 'out') {
					if (elements.contains(elem) && lastMove.contains(elem)) {
						fire.call( elem, 'mouseout' );
						lastMove.erase(elem);
					}
				} else if (type == 'up') {
					if (handler.isOver(elem)) {
						fire.call( elem, 'mouseup' );
						if (elements.contains(elem) && lastDown.contains(elem)) {
							fire.call( elem, 'click' );
						}
					}
				}
			// мышь над элементом, сообщаем о mousemove
			// о mouseover, mousedown, click, если необходимо
			} else if (handler.isOver(elem)) {
				if (type == 'move') {
					if (!lastMove.contains(elem)) {
						fire.call( elem, 'mouseover' );
						lastMove.push( elem );
					}
				} else if (type == 'down') {
					lastDown.push(elem);
				// If mouseup on this elem and last mousedown was on this elem - click
				} else if (type == 'up' && elements.contains(elem) && lastDown.contains(elem)) {
					fire.call( elem, 'click' );
				}
				fire.call( elem, 'mouse' + type );

				if (!this.checkFalling()) {
					stopped = true;
				}
			// мышь не над элементом, событие проваливается,
			// сообщаем элементу, что где-то произошло событие
			} else if (!lastOut.contains(elem)) {
				// fast version
				elem.events.fire( 'away:mouse' + type, eventArgs );
			}
		}

		return stopped;
	},

	/** @private */
	forceEvent: function (type, event, stopped, elements) {
		var
			children,
			elem,
			i = elements.sort( this.compareFunction ).length;
		while (i--) {
			elem = elements[i];
			if (!this.isOver(elem)) continue;

			elem.events.fire( type, [ event ]);
			children = elem.childrenElements;
			if (children && children.length) {
				this.forceEvent(type, event, stopped, children);
			}
			if (!this.checkFalling()) {
				stopped = true;
				break;
			}
		}
		return stopped;
	}

});