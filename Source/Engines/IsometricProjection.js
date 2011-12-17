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

LibCanvas.Engines.IsometricProjection = atom.Class(
/** @lends LibCanvas.Engines.IsometricProjection# */
{

	/**
	 * factor (and default factor in proto)
	 * @property {Point3D}
	 */
	factor: [0.866, 0.5, 0.866],

	/**
	 * @constructs
	 * @param {Point3D} factor
	 */
	initialize: function (factor) {
		atom.Class.bindAll( this );
		this.factor = Point3D( factor || this.factor );
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
		);
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
			dXY = (point.y + z * this.factor.z) / this.factor.y,
			pX  = (point.x / this.factor.x - dXY) / 2;

		return new Point3D( pX, pX + dXY, z );
	}
});