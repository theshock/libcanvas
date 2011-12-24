/*
---

name: "Shapes.Rectangle"

description: "Provides rectangle as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Rectangle

...
*/

/** @name Rectangle */
var Rectangle = LibCanvas.Shapes.Rectangle = Class(
/**
 * @lends LibCanvas.Shapes.Rectangle.prototype
 * @augments LibCanvas.Shape.prototype
 */
{
	Extends: Shape,
	/**
	 * @constructs
	 * @param {number} fromX
	 * @param {number} fromY
	 * @param {number} width
	 * @param {number} height
	 * @returns {LibCanvas.Shapes.Rectangle}
	 */
	set : function () {
		var a = Array.pickFrom(arguments);

		if (a.length == 4) {
			this.from = new Point(a[0], a[1]);
			this.to   = new Point(a[0]+a[2], a[1]+a[3]);
		} else if (a.length == 2) {
			if ('width' in a[1] && 'height' in a[1]) {
				this.set({ from: a[0], size: a[1] });
			} else {
				this.from = Point(a[0]);
				this.to   = Point(a[1]);
			}
		} else {
			a = a[0];
			if (a.from) {
				this.from = Point(a.from);
			} else if ('x' in a && 'y' in a) {
				this.from = new Point(a.x, a.y);
			}
			if (a.to) this.to = Point(a.to);
		
			if (!a.from || !a.to) {
				var as = a.size,
					sizeX = (as ? [as.w, as[0], as.width ] : [ a.w, a.width  ]).pick(),
					sizeY = (as ? [as.h, as[1], as.height] : [ a.h, a.height ]).pick();
				if (this.from) {
					this.to   = new Point(this.from.x + sizeX, this.from.y + sizeY);
				} else {
					this.from = new Point(this.to.x   - sizeX, this.to.y   - sizeY);
				}
			}
		
		}
		return this;
	},

	get width() {
		return this.to.x - this.from.x;
	},
	get height() {
		return this.to.y - this.from.y;
	},
	set width (width) {
		this.to.moveTo({ x : this.from.x + width, y : this.to.y });
	},
	set height (height) {
		this.to.moveTo({ x : this.to.x, y : this.from.y + height });
	},
	get size () {
		return {
			width : this.width,
			height: this.height
		};
	},
	set size (size) {
		if (size.width != this.width || size.height != this.height) {
			this.to.moveTo([ this.from.x + size.width, this.from.y + size.height ]);
		}
	},
	// @deprecated 
	getWidth : function () {
		return this.width;
	},
	// @deprecated
	getHeight : function () {
		return this.height;
	},
	// @deprecated 
	setWidth : function (width) {
		this.width = width;
		return this;
	},
	// @deprecated
	setHeight : function (height) {
		this.height = height;
		return this;
	},
	/** @returns {boolean} */
	hasPoint : function (point, padding) {
		point   = Point(arguments);
		padding = padding || 0;
		return point.x != null && point.y != null
			&& point.x.between(Math.min(this.from.x, this.to.x) + padding, Math.max(this.from.x, this.to.x) - padding, 1)
			&& point.y.between(Math.min(this.from.y, this.to.y) + padding, Math.max(this.from.y, this.to.y) - padding, 1);
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	align: function (rect, sides) {
		if (sides == null) sides = 'center middle';

		var moveTo = this.from.clone();
		if (sides.indexOf('left') != -1) {
			moveTo.x = rect.from.x;
		} else if (sides.indexOf('center') != -1) {
			moveTo.x = rect.from.x + (rect.width - this.width) / 2;
		} else if (sides.indexOf('right') != -1) {
			moveTo.x = rect.to.x - this.width;
		}

		if (sides.indexOf('top') != -1) {
			moveTo.y = rect.from.y;
		} else if (sides.indexOf('middle') != -1) {
			moveTo.y = rect.from.y + (rect.height - this.height) / 2;
		} else if (sides.indexOf('bottom') != -1) {
			moveTo.y = rect.to.y - this.height;
		}

		return this.moveTo( moveTo );
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	moveTo: function (rect) {
		if (rect instanceof Point) {
			this.move( this.from.diff(rect) );
		} else {
			rect = Rectangle(arguments);
			this.from.moveTo(rect.from);
			this.  to.moveTo(rect.to);
		}
		return this;
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	draw : function (ctx, type) {
		// fixed Opera bug - cant drawing rectangle with width or height below zero
		ctx.original(type + 'Rect', [
			Math.min(this.from.x, this.to.x),
			Math.min(this.from.y, this.to.y),
			this.width .abs(),
			this.height.abs()
		]);
		return this;
	},
	/** @returns {LibCanvas.Context2D} */
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		ctx.ctx2d.rect( this.from.x, this.from.y, this.width, this.height );
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	/** @returns {boolean} */
	intersect : function (obj) {
		if (obj.self != this.self) {
			if (obj.getBoundingRectangle) {
				obj = obj.getBoundingRectangle();
			} else return false;
		}
		return this.from.x < obj.to.x && this.to.x > obj.from.x
			&& this.from.y < obj.to.y && this.to.y > obj.from.y;
	},
	getBoundingRectangle: function () {
		return this;
	},
	/** @returns {LibCanvas.Point} */
	getRandomPoint : function (margin) {
		margin = margin || 0;
		return new Point(
			Number.random(margin, this.width  - margin),
			Number.random(margin, this.height - margin)
		);
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	translate : function (point, fromRect) {
		var diff = fromRect.from.diff(point);
		return new Point({
			x : (diff.x / fromRect.width ) * this.width,
			y : (diff.y / fromRect.height) * this.height
		});
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	fillToPixel: function () {
		var from = this.from, to = this.to,
			point = function (method, invoke) {
				return new Point(
					Math[method](from.x, to.x),
					Math[method](from.y, to.y)
				).invoke( invoke );
			};

		return new Rectangle(
			point( 'min', 'floor' ),
			point( 'max', 'ceil'  )
		);
	},
	/** @returns {LibCanvas.Shapes.Rectangle} */
	snapToPixel: function () {
		this.from.snapToPixel();
		this.to.snapToPixel().move(new Point(-1, -1));
		return this;
	},
	/** @returns {string} */
	dump: function (name) {
		return this.parent(name || 'Rectangle');
	},
	/** @returns {LibCanvas.Shapes.Polygon} */
	toPolygon: function () {
		return new Polygon(
			this.from.clone(), this.topRight, this.to.clone(), this.bottomLeft
		);
	},
	/** @returns {string} */
	toString: Function.lambda('[object LibCanvas.Shapes.Rectangle]')
});