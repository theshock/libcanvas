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
		scene.libcanvas.addElement( this );
		this.stopDrawing();
		
		this.scene = scene;
		this.setOptions( options );

		if (this.options.shape) {
			this.shape = this.options.shape;
			this.previousBoundingShape = this.shape;
		}
	},

	previousBoundingShape: null,
	get currentBoundingShape () {
		return this.shape;
	},

	redraw: function () {
		this.scene.redrawElement( this );
		return this;
	},

	onUpdate: function ( time ) {
		return this;
	},

	renderTo: function () {
		this.previousBoundingShape = this.shape.clone().grow(1);
	}
});