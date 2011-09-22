/*
---

name: "Scene.Standard"

description: "LibCanvas.Scene"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- LibCanvas.Canvas2D
	- Behaviors.Drawable

provides: Scene.Standard

...
*/

LibCanvas.Scene.Standard = Class(
/**
 * @lends LibCanvas.Scene.Standard#
 * @augments Drawable
 */
{
	Extends: Drawable,

	/**
	 * @param {LibCanvas.Canvas2D} libcanvas
	 * @returns {LibCanvas.Scene.Standard}
	 */
	initialize: function (libcanvas) {
		libcanvas.addElement( this );
		this.elements       = [];
		this.redrawElements = [];
		return this;
	},

	/** @private */
	elements: null,

	/** @private */
	redrawElements: null,

	/**
	 * @param {atom.Class} Class
	 * @returns {function}
	 */
	createFactory: function (Class) {
		return function () {
			return Class.factory( [this].append( arguments ) );
		}.bind( this );
	},

	/**
	 * @param {Drawable} element
	 * @returns {LibCanvas.Scene.Standard}
	 */
	addElement: function (element) {
		this.elements.include( element );
		return this;
	},

	/**
	 * @private
	 * @param {Drawable} element
	 * @returns {LibCanvas.Scene.Standard}
	 */
	redrawElement: function (element) {
		if (this.elements.contains( element )) {
			this.redrawElements.include( element );
		}
		return this;
	},

	/**
	 * @param {Drawable} element
	 * @returns {LibCanvas.Scene.Standard}
	 */
	rmElement: function (element) {
		this.elements.erase( element );
		return this;
	},

	/** @private */
	update: function (time) {
		this.elements.sortBy( 'zIndex' ).invoke( 'onUpdate' );

		return this.fireEvent( 'update', [ time ]);
	},

	/** @private */
	findIntersections: function (shape) {
		var i, e, elems = [];
		for (i = this.elements.length; i--;) {
			e = this.elements[i];
			if (e.currentBoundingShape.intersect( shape )) {
				elems.push( e );
			}
		}
		return elems;
	},


	/** @private */
	draw: function () {
		var i, l, elem, clear = [],
			redraw = this.redrawElements,
			add    = this.redrawElement.bind( this );

		for (i = 0; i < redraw.length; i++) {
			elem = redraw[i];
			clear.push( elem.previousBoundingShape );

			this.findIntersections(elem.previousBoundingShape)
				.forEach( add );
			this.findIntersections(elem.currentBoundingShape )
				.forEach(function (e) {
					// we need to redraw it, only if it is over our element
					if (e.zIndex > elem.zIndex) add( e );
				});
		}

		redraw.sortBy( 'zIndex' );

		for (i = 0, l = redraw.length; i < l; i++) {
			redraw[ i ].renderTo( this.libcanvas.ctx );
		}
		redraw.empty();

		return this.fireEvent( 'render', [ this.libcanvas.ctx ]);
	}
});