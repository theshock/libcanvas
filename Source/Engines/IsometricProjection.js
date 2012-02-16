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

declare( 'LibCanvas.Engines.IsometricProjection', {

	/**
	 * factor (and default factor in proto)
	 * @property {Point3D}
	 */
	factor: [0.866, 0.5, 0.866],

	/**
	 * center (and default center in proto)
	 * @property {Point}
	 */
	center: [0, 0],

	/**
	 * @constructs
	 * @param {Point3D} factor
	 */

	/**
	 * @constructs
	 * @param {object} settings
	 * @param {Point3D} settings.factor - length of top and bottom lines
	 * @param {Point} settings.center - position of [0,0] coordinate
	 * @param {int} settings.chordLength - height of left and right triangle
	 * @param {int} settings.hexHeight   - height of the hex (length between top and bottom lines)
	 */
	initialize: function (settings) {
		this.bindMethods();
		this.settings = new Settings(settings);
		this.factor = Point3D( this.settings.get('factor') || this.factor );
		this.center = Point  ( this.settings.get('center') || this.center )
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
		).move(this.center);
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
			center = this.center,
			dXY = ((point.y - center.y) + z * this.factor.z) / this.factor.y,
			pX  = ((point.x - center.x) / this.factor.x - dXY) / 2;

		return new Point3D( pX, pX + dXY, z );
	}
});