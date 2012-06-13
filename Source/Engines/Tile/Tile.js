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
var TileEngine = LibCanvas.declare( 'LibCanvas.Engines.Tile', 'TileEngine', {

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
			cell  = new TileEngine.Cell( this, point, shape, value );

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