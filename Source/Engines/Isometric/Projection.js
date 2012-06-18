/*
---

name: "Engines.Isometric.Projection"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point3D
	- Engines.Isometric

provides: Engines.Isometric.Projection

...
*/

/** @class IsometricProjection */
atom.declare( 'LibCanvas.Engines.Isometric.Projection', {

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