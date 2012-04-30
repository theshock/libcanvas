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
		return this.element.engine.getCellByPoint( this.mouse.point );
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