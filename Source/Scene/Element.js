/*
---

name: "Scene.Element"

description: "LibCanvas.Scene"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Scene
	- Behaviors.Drawable

provides: Scene.Element

...
*/

LibCanvas.Scene.Element = Class(
/**
 * @lends LibCanvas.Scene.Element#
 * @augments Drawable
 */
{
	Extends: Drawable,

	Implements: Class.Options,

	initialize: function (scene, options) {
		scene.libcanvas.addElement( this ).stopDrawing();
		this.scene = scene;
		this.setOptions( options );

		if (this.options.shape) {
			this.shape = this.options.shape;
			this.updateBoundingShapes();
		}
	},

	previousBoundingShape: null,
	currentBoundingShape : null,

	/** @private */
	updateBoundingShapes: function () {
		if ( !this.previousBoundingShape ) {
			if (!this.shape) throw new TypeError( 'shape is required' );

			this.previousBoundingShape = this.shape.clone();
			this.currentBoundingShape  = this.shape.clone();
		} else {
			this.previousBoundingShape.set( this.currentBoundingShape );
			this.currentBoundingShape .set( this.shape );
		}
		return this;
	},

	onUpdate: function ( time ) {
		return this;
	},

	renderTo: function ( ctx ) {
		return this.updateBoundingShapes();
	}
});