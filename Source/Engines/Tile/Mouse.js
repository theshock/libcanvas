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
	eventsList: 'mousemove mouseout mousedown mouseup contextmenu'
		.split(' '),

	initialize: function (element, mouse) {
		this.bindMethods(this.eventsList);

		this.mouse    = mouse;
		this.element  = element;
		this.events   = new Events(this);
		this.previous = null;
		this.lastDown = null;

		this.subscribe(false);
	},

	subscribe: function (un) {
		var events = atom.object.collect(this, this.eventsList, null);

		this.element.events
			[ un ? 'remove' : 'add' ]
			(events);
	},

	mousemove: function () {
		var cell = this.get();
		if (this.previous != cell) {
			this.outCell();
			this.fire( 'over', cell );
			this.previous = cell;
		}
	},
	mouseout: function () {
		this.outCell();
	},
	mousedown: function () {
		var cell = this.get();
		this.fire( 'down', cell );
		this.lastDown = cell;
	},
	mouseup: function () {
		var cell = this.get();
		this.fire( 'up', cell );
		if (cell != null && cell == this.lastDown) {
			this.fire( 'click', cell );
		}
		this.lastDown = null;
	},
	contextmenu: function () {
		var cell = this.get();
		if (cell != null) {
			this.fire( 'contextmenu', cell );
		}
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