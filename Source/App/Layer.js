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

		this.intersection  = this.settings.get('intersection');
		this.redrawAllMode = this.intersection === 'all' || this.intersection === 'full';

		this.app      = app;
		this.elements = [];
		this.redraw   = this.redrawAllMode ? this.elements : [];
		this.clear    = [];
		this.createDom();
	},

	get ctx () {
		return this.dom.canvas.ctx;
	},

	/** @private */
	stopped: false,

	destroy: function () {
		atom.array.invoke( this.elements, 'destroy' );
		this.dom.destroy();
	},

	hide: function () {
		this.dom.element.css({ display: 'none' });
		return this.stop();
	},

	show: function () {
		this.dom.element.css({ display: '' });
		return this.stop();
	},

	start: function () {
		this.stopped = false;
		return this;
	},

	stop: function () {
		this.stopped = true;
		return this;
	},

	redrawAll: function () {
		atom.array.invoke( this.elements, 'redraw' );
		return this;
	},

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
		var
			intersection = this.intersection,
			ctx          = this.dom.canvas.ctx,
			resources    = this.app.resources;

		if (intersection === 'full') {
			ctx.clearAll();
		} else {
			if (intersection === 'auto') {
				this.addIntersections();
			} else if (intersection === 'all') {
				atom.array.invoke(this.clear, 'clearPrevious', ctx, resources);
			}

			atom.array.invoke(this.redraw, 'clearPrevious', ctx, resources);
		}

		this.drawElements(this.redraw, ctx, resources);

		if (intersection === 'all') {
			this.clear.length = 0;
		} else if (intersection !== 'full') {
			this.redraw.length = 0;
		}
	},

	/** @private */
	drawElements: function (elements, ctx, resources) {
		// draw elements with the lower zIndex first
		atom.array.sortBy( elements, 'zIndex' );

		for (var i = elements.length; i--;) {
			this.drawElement(elements[i], ctx, resources);
		}
	},

	/** @private */
	drawElement: function (elem, ctx, resources) {
		if (elem.layer == this) {
			elem.redrawRequested = false;
			if (elem.isVisible()) {
				elem.renderToWrapper( ctx, resources );
				if (this.intersection !== 'full') {
					elem.saveCurrentBoundingShape();
				}
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
			this.settings.subset([ 'name', 'zIndex', 'size' ])
		);
	},

	/** @private */
	addElement: function (element) {
		if (element.layer != this) {
			if (element.layer) {
				element.layer.rmElement( element );
			}

			element.layer = this;
			this.elements.push( element );
			this.redrawElement( element );
		}
		return this;
	},

	/** @private */
	rmElement: function (element) {
		if (element.layer == this) {
			if (this.intersection === 'all') {
				this.needUpdate = true;
				this.clear.push(element);
			} else {
				this.redrawElement( element );
			}
			atom.core.eraseOne( this.elements, element );
			element.layer = null;
		}
		return this;
	},

	/** @private */
	redrawElement: function (element) {
		if (element.layer == this && !element.redrawRequested) {
			this.needUpdate = true;
			element.redrawRequested = true;
			if (!this.redrawAllMode) {
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
