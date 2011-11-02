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

Scene.Standard = Class(
/**
 * @lends LibCanvas.Scene.Standard#
 * @augments Drawable
 */
{
	Extends: Drawable,

	Implements: Class.Options,

	/**
	 * @param {LibCanvas.Canvas2D} libcanvas
	 * @returns {LibCanvas.Scene.Standard}
	 */
	initialize: function (libcanvas, options) {
		Class.bindAll( this, 'redrawElement' );

		this.setOptions({
			intersection: 'auto' // 'auto'|'manual'
		}, options );

		libcanvas.addElement( this );
		this.resources = new Scene.Resources( this );
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
		var scene = this;
		return function () {
			var element = Class.factory( [ scene ].append( arguments ) );
			scene.addElement( element );
			return element;
		};
	},

	/**
	 * @param {Drawable} element
	 * @returns {LibCanvas.Scene.Standard}
	 */
	addElement: function (element) {
		this.elements.include( element );
		this.redrawElement( element );
		return this;
	},

	/**
	 * @private
	 * @param {Drawable} element
	 * @returns {LibCanvas.Scene.Standard}
	 */
	redrawElement: function (element) {
		if (this.elements.contains( element )) {
			if (!this.redrawElements.contains( element )) {
				this.redrawElements.push( element );
				this.libcanvas.update();
			}
		}
		return this;
	},

	/**
	 * @param {Drawable} element
	 * @returns {LibCanvas.Scene.Standard}
	 */
	rmElement: function (element) {
		this.redrawElement ( element );
		this.elements.erase( element );
		return this;
	},

	/** @private */
	update: function (time) {
		this.elements.sortBy( 'zIndex' ).invoke( 'onUpdate', time, this.resources );

		return this.fireEvent( 'update', [ time, this.resources ]);
	},

	/** @private */
	findIntersections: function (shape, elem) {
		var i, e, elems = [];
		for (i = this.elements.length; i--;) {
			e = this.elements[i];
			if (e != elem && e.currentBoundingShape.intersect( shape )) {
				elems.push( e );
			}
		}
		return elems;
	},


	/** @private */
	draw: function () {
		var i, l, elem, clear = [],
			ctx = this.libcanvas.ctx,
			redraw = this.redrawElements;

		for (i = 0; i < redraw.length; i++) {
			elem = redraw[i];
			clear.push( elem );

			if (this.options.intersection !== 'manual') {
				this.findIntersections(elem.previousBoundingShape, elem)
					.forEach(function (e) {
						redraw.include( e );
					});
				this.findIntersections(elem.currentBoundingShape, elem)
					.forEach(function (e) {
						// we need to redraw it, only if it is over our element
						if (e.zIndex > elem.zIndex) redraw.include( e );
					});
			}
		}

		for (i = clear.length; i--;) {
			clear[i].clearPrevious( ctx );
		}

		redraw.sortBy( 'zIndex', true );

		for (i = 0, l = redraw.length; i < l; i++) {
			if (this.elements.contains( redraw[ i ] )) {
				redraw[ i ].renderTo( ctx, this.resources );
			}
		}
		redraw.empty();

		return this.fireEvent( 'render', [ ctx, this.resources ]);
	}
});