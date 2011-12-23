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
 * @lends Scene.Standard#
 * @augments Drawable
 */
{
	Extends: Drawable,

	Implements: Class.Options,

	/**
	 * @param {Canvas2D} libcanvas
	 * @returns {Scene.Standard}
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
		this.shift = new Point(0, 0);
		this.elementsShift = new Point(0, 0);
	},

	/** @private */
	stopped: false,

	/** @returns {Scene.Standard} */
	start: function () {
		if (this.stopped) {
			this.libcanvas.update();
			this.stopped = false;
		}
		return this;
	},

	/** @returns {Scene.Standard} */
	stop: function () {
		this.stopped = true;
		return this;
	},

	_mouse: null,

	get mouse () {
		if (this._mouse == null) {
			this._mouse = new Scene.Mouse( this.resources.mouse );
		}
		return this._mouse;
	},

	/** @private */
	elements: null,

	/** @private */
	redrawElements: null,

	/**
	 * @deprecated
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
	 * @private
	 * @property {Point}
	 */
	shift: null,

	/**
	 * @private
	 * @property {Point}
	 */
	elementsShift: null,

	/**
	 * @param {LibCanvas.Point} shift
	 * @returns {Scene.Standard}
	 */
	addElementsShift: function (shift) {
		if (!shift) {
			shift = this.elementsShift.diff(this.shift);
		} else {
			shift = Point(shift);
		}
		var e = this.elements, i = e.length;
		while (i--) e[i].addShift(shift);
		this.elementsShift.move(shift);
		return this;
	},

	/**
	 * @private
	 * @property {LibCanvas.Shapes.Rectangle}
	 */
	limitShift: null,

	/**
	 * @param {LibCanvas.Shapes.Rectangle} limitShift
	 * @returns {Scene.Standard}
	 */
	setLimitShift: function (limitShift) {
		this.limitShift = limitShift ? Rectangle(limitShift) : null;
		return this;
	},

	/**
	 * @param {Point} shift
	 * @returns {Scene.Standard}
	 */
	addShift: function ( shift, withElements ) {
		shift = new Point( shift );

		var limit = this.limitShift, current = this.shift;
		if (limit) {
			shift.x = shift.x.limit(limit.from.x - current.x, limit.to.x - current.x);
			shift.y = shift.y.limit(limit.from.y - current.y, limit.to.y - current.y);
		}

		current.move( shift );
		this.libcanvas.addShift( shift );
		this.libcanvas.ctx.translate( shift, true );
		if (withElements) this.addElementsShift( shift );
		return this;
	},

	/**
	 * @param {Point} shift
	 * @returns {Scene.Standard}
	 */
	setShift: function (shift, withElements) {
		return this.addShift( this.shift.diff(shift), withElements );
	},

	/**
	 * @returns {Point}
	 */
	getShift: function () {
		return this.shift;
	},

	/**
	 * @param {Drawable} element
	 * @returns {Scene.Standard}
	 */
	addElement: function (element, force) {
		if (force || !this.elements.contains(element)) {
			this.elements.push( element );
			this.redrawElement( element, true );
		}
		return this;
	},

	/**
	 * @private
	 * @param {Drawable} element
	 * @returns {Scene.Standard}
	 */
	redrawElement: function (element, force) {
		if (force || this.elements.contains( element )) {
			if (force || !this.redrawElements.contains( element )) {
				this.redrawElements.push( element );
				this.libcanvas.update();
			}
		}
		return this;
	},

	/**
	 * @param {Drawable} element
	 * @returns {Scene.Standard}
	 */
	rmElement: function (element) {
		this.redrawElement ( element );
		this.elements.erase( element );
		return this;
	},

	/** @private */
	update: function (time) {
		if (this.stopped) return this;

		this.elements.sortBy( 'zIndex' ).invoke( 'onUpdate', time, this.resources );

		return this.fireEvent( 'update', [ time, this.resources ]);
	},

	/** @private */
	findIntersections: function (shape, elem) {
		var i, e, elems = [];
		for (i = this.elements.length; i--;) {
			e = this.elements[i];
			if (e != elem && !e.options.hidden && e.currentBoundingShape.intersect( shape )) {
				elems.push( e );
			}
		}
		return elems;
	},

	/** @private */
	autoIntersectionsSearch: function () {
		return this.options.intersection !== 'manual';
	},

	/** @private */
	draw: function () {
		if (this.stopped) return this;
		
		var i, l, elem,
			clear     = [],
			elements  = this.elements,
			resources = this.resources,
			ctx       = this.libcanvas.ctx,
			redraw    = this.redrawElements;

		for (i = 0; i < redraw.length; i++) {
			elem = redraw[i];
			clear.push( elem );

			if (this.autoIntersectionsSearch()) {
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
			clear[i].clearPrevious( ctx, resources );
		}

		redraw.sortBy( 'zIndex', true );
		for (i = 0, l = redraw.length; i < l; i++) {
			elem = redraw[i];
			if (!elem.options.hidden && elements.indexOf( elem ) >= 0) {
				elem.renderTo( ctx, resources );
				elem.saveCurrentBoundingShape();
			}
		}
		redraw.empty();

		return this.fireEvent( 'render', [ ctx, resources ]);
	}
});