/*
---

name: "App.Layer"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App
	- App.Dom

provides: App.Layer

...
*/

/** @class App.Layer */
declare( 'LibCanvas.App.Layer', {

	initialize: function (app, settings) {
		this.settings = new Settings({
			invoke      : app.settings.get('invoke'),
			intersection: 'auto' // auto|manual|all
		}).set(settings);

		this.shouldRedrawAll = this.settings.get('intersection') === 'all';

		this.app      = app;
		this.elements = [];
		this.redraw   = this.shouldRedrawAll ? this.elements : [];
		this.clear    = [];
		this.createDom();
	},

	get ctx () {
		return this.dom.canvas.ctx;
	},

	/** @private */
	stopped: false,

	start: function () {
		this.stopped = false;
		return this;
	},

	stop: function () {
		this.stopped = true;
		return this;
	},

	/** @private */
	shouldRedrawAll: false,

	/** @private */
	tick: function (time) {
		if (this.stopped) return this;

		if (this.settings.get( 'invoke' )) {
			this.sortElements();
			this.updateAll(time);
		}

		if (this.needUpdate) {
			this.draw();
			this.needUpdate = false;
		}

		return this;
	},


	/** @private */
	draw: function () {
		var i,
			ctx = this.dom.canvas.ctx,
			redraw = this.redraw,
			clear  = this.clear,
			resources = this.app.resources;

		if (this.settings.get('intersection') === 'auto') {
			this.addIntersections();
		}

		// draw elements with the lower zIndex first
		atom.array.sortBy( redraw, 'zIndex' );

		if (this.shouldRedrawAll) {
			atom.array.invoke(clear, 'clearPrevious', ctx, resources);
		}

		atom.array.invoke(redraw, 'clearPrevious', ctx, resources);

		for (i = redraw.length; i--;) {
			this.drawElement(redraw[i], ctx, resources);
		}

		if (this.shouldRedrawAll) {
			clear.length = 0;
		} else {
			redraw.length = 0;
		}
	},

	drawElement: function (elem, ctx, resources) {
		if (elem.layer == this) {
			elem.redrawRequested = false;
			if (elem.isVisible()) {
				elem.renderToWrapper( ctx, resources );
				elem.saveCurrentBoundingShape();
			}
		}
	},

	/** @private */
	sortElements: function () {
		atom.array.sortBy( this.elements, 'zIndex' );
	},

	/** @private */
	updateAll: function (time) {
		atom.array.invoke( this.elements, 'onUpdate', time, this.app.resources );
	},

	/** @private */
	needUpdate: false,

	/** @private */
	createDom: function () {
		this.dom = this.app.container.createDom(
			this.settings.subset([ 'name', 'zIndex' ])
		);
	},

	/** @private */
	addElement: function (element) {
		if (element.layer != this) {
			element.layer = this;
			this.elements.push( element );
			this.redrawElement( element );
		}
		return this;
	},

	/** @private */
	rmElement: function (element) {
		if (element.layer == this) {
			if (this.shouldRedrawAll) {
				this.needUpdate = true;
				this.clear.push(element);
			} else {
				this.redrawElement( element );
			}
			atom.array.erase( this.elements, element );
			element.layer = null;
		}
		return this;
	},

	/** @private */
	redrawElement: function (element) {
		if (element.layer == this && !element.redrawRequested) {
			this.needUpdate = true;
			element.redrawRequested = true;
			if (!this.shouldRedrawAll) {
				this.redraw.push( element );
			}
		}
		return this;
	},

	/** @private */
	addIntersections: function () {
		var i, elem, layer = this;

		for (i = 0; i < this.redraw.length; i++) {
			elem = this.redraw[i];

			this.findIntersections(elem.previousBoundingShape, elem, this.redrawElement);
			this.findIntersections(elem. currentBoundingShape, elem, function (e) {
				// we need to redraw it, only if it will be over our element
				if (e.zIndex > elem.zIndex) {
					layer.redrawElement( e );
				}
			});
		}
	},

	/** @private */
	findIntersections: function (shape, elem, fn) {
		if (!shape) return;

		var i = this.elements.length, e;
		while (i--) {
			e = this.elements[i];
			// check if we need also `e.currentBoundingShape.intersect( shape )`
			if (e != elem && e.isVisible() &&
				e.previousBoundingShape &&
				e.previousBoundingShape.intersect( shape )
			) fn.call( this, e );
		}
	}

});