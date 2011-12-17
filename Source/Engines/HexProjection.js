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

LibCanvas.Engines.HexProjection = atom.Class({
	Extends: atom.Class.Options,

	options: {
		baseLength : 0,
		chordLength: 0,
		hexHeight  : 0,
		start      : new Point(0, 0)
	},
	/**
	 * @param {object} options
	 * @param {int} options.baseLength  - length of top and bottom lines
	 * @param {int} options.chordLength - height of left and right triangle
	 * @param {int} options.hexHeight   - height of the hex (length between top and bottom lines)
	 */
	initialize: function (options) {
		this.setOptions( options );
	},

	/**
	 * @param {int[]} coordinates
	 * @returns {Point}
	 */
	rgbToPoint: function (coordinates) {
		var
			red     = coordinates[0],
			green   = coordinates[1],
			blue    = coordinates[2],
			options = this.options,
			base    = options.baseLength,
			chord   = options.chordLength,
			height  = options.hexHeight,
			start   = options.start;
		if (red + green + blue !== 0) {
			throw new Error( 'Wrong coordinates: ' + red + ' ' + green + ' ' + blue);
		}

		return new Point(
			start.x + (base + chord) * red,
			start.y + (blue - green) * height / 2
		);
	},

	/**
	 * @param {Point} center
	 * @returns {LibCanvas.Shapes.Polygon}
	 */
	createPolygon: function (center) {
		var
			options = this.options,
			halfBase   = options.baseLength / 2,
			halfHeight = options.hexHeight  / 2,
			radius  = halfBase + options.chordLength,

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