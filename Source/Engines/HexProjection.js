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
	 * @param {object} options
	 * @param {int} options.baseLength  - length of top and bottom lines
	 * @param {int} options.chordLength - height of left and right triangle
	 * @param {int} options.hexHeight   - height of the hex (length between top and bottom lines)
	 */
	initialize: function (options) {
		this.settings = new Settings({
			baseLength : 0,
			chordLength: 0,
			hexHeight  : 0,
			start      : new Point(0, 0)
		});
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
			rF = red  .floor(), rC = red  .ceil(),
			gF = green.floor(), gC = green.ceil(),
			bF = blue .floor(), bC = blue .ceil();

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
			return v.sum() == 0;
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
				min.x = min.x.min( c.x );
				min.y = min.y.min( c.y );
				max.x = max.x.max( c.x );
				max.y = max.y.max( c.y );
			}
		}

		return this._limits = { min: min, max: max };
	},

	/** @return Point */
	size: function () {
		var
			limits   = this.limits(),
			settings = this.projection.settings,
			base     = settings.get('baseLength'),
			chord    = settings.get('chordLength'),
			height   = settings.get('hexHeight'),
			padding  = this.padding;

		return new Point(
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