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
	- Mouse
	- App
	- App.PointSearch

provides: App.MouseHandler

...
*/

/** @class App.MouseHandler */
declare( 'LibCanvas.App.MouseHandler', {

	events: 'down up move out dblclick contextmenu wheel'.split(' '),

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
			new App.PointSearch();

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
			atom.core.eraseOne(this.lastMouseDown, elem);
			atom.core.eraseOne(this.lastMouseMove, elem);
			this.search.remove(elem);
		}
		return this;
	},

	unsubscribeAll: function () {
		this.subscribers.length = 0;
		this.search.removeAll();
		return this;
	},

	fall: function () {
		this.falling = true;
		return this;
	},

	getOverElements: function () {
		if (!this.mouse.inside) return [];

		var
			elements = this.search.findByPoint( this.mouse.point ),
			i = elements.length;

		while (i--) if (!elements[i].layer) {
			this.unsubscribe(elements[i]);
			elements.splice(i, 1);
		}

		return elements.sort( this.compareFunction );
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
					stopped = true;
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