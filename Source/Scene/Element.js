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

Scene.Element = Class(
/**
 * @lends LibCanvas.Scene.Element#
 * @augments Drawable
 */
{
	Extends: Drawable,

	Implements: Class.Options,

	/** @constructs */
	initialize: function (scene, options) {
		scene.libcanvas.addElement( this );
		this.stopDrawing();
		
		this.scene = scene;
		this.setOptions( options );

		if (this.options.shape) {
			this.shape = this.options.shape;
			this.previousBoundingShape = this.shape;
		}
		if (this.options.zIndex != null) {
			this.zIndex = Number( this.options.zIndex );
		}
	},

	previousBoundingShape: null,

	get currentBoundingShape () {
		return this.shape;
	},

	destroy: function () {
		this.scene.rmElement( this );
		return this;
	},

	redraw: function () {
		this.scene.redrawElement( this );
		return this;
	},

	onUpdate: function ( time ) {
		return this;
	},

	renderTo: function () {
		this.previousBoundingShape = this.shape.clone().grow( 2 );
	}
});