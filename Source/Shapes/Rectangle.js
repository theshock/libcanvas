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

/** @class Rectangle */
var Rectangle = LibCanvas.declare( 'LibCanvas.Shapes.Rectangle', 'Rectangle', Shape, {
	set : function () {
		var a = atom.array.pickFrom(arguments);

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
					sizeX = atom.array.pick(as ? [as.w, as[0], as.width ] : [ a.w, a.width  ]),
					sizeY = atom.array.pick(as ? [as.h, as[1], as.height] : [ a.h, a.height ]);
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
		this.to.x = this.from.x + width;
	},
	set height (height) {
		this.to.y = this.from.y + height;
	},
	get size () {
		return new Size( this.width, this.height );
	},
	set size (size) {
		if (size.width != this.width || size.height != this.height) {
			this.to.set(this.from.x + size.width, this.from.y + size.height);
		}
	},
	/** @returns {boolean} */
	hasPoint : function (point, padding) {
		point   = Point(arguments);
		padding = padding || 0;
		return point.x != null && point.y != null
			&& atom.number.between(point.x, Math.min(this.from.x, this.to.x) + padding, Math.max(this.from.x, this.to.x) - padding, 1)
			&& atom.number.between(point.y, Math.min(this.from.y, this.to.y) + padding, Math.max(this.from.y, this.to.y) - padding, 1);
	},
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
			Math.abs(this.width ),
			Math.abs(this.height)
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
		if (obj.prototype != this.constructor) {
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
			atom.number.random(margin, this.width  - margin),
			atom.number.random(margin, this.height - margin)
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
			point = function (side, round) {
				return new Point(
					Math[round](Math[side](from.x, to.x)),
					Math[round](Math[side](from.y, to.y))
				);
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
		return Shape.prototype.dump.call(this, name || 'Rectangle');
	},
	/** @returns {LibCanvas.Shapes.Polygon} */
	toPolygon: function () {
		return new Polygon(
			this.from.clone(), this.topRight, this.to.clone(), this.bottomLeft
		);
	}
});