/*
---

name: "TileEngine.Cell"

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