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
var MinusOnePoint = new Point(-1, -1);

var Rectangle = LibCanvas.declare( 'LibCanvas.Shapes.Rectangle', 'Rectangle', Shape, {
	set : function () {
		var
			center,
			size,
			a = atom.array.pickFrom(arguments),
			first = a[0];

		this.from = null;
		this.to   = null;

		if (a.length == 4) {
			this.from = new Point(a[0], a[1]);
			this.to   = new Point(a[0]+a[2], a[1]+a[3]);
		} else if (a.length == 2) {
			if ('width' in a[1] && 'height' in a[1]) {
				this.set({ from: a[0], size: a[1] });
			} else {
				this.from = Point.from(a[0]);
				this.to   = Point.from(a[1]);
			}
		} else if (first.center && first.size) {
			center = Point.from(first.center);
			size   = Size.from(first.size);

			this.from = new Point(center.x - size.x/2, center.y - size.y/2);
			this.to   = new Point(center.x + size.x/2, center.y + size.y/2);
		} else {
			if (first.from) this.from = Point.from(first.from);
			if (first.to  ) this.to   = Point.from(first.to);

			if (!this.from || !this.to && first.size) {
				size = Size.from(first.size);

				if (this.from) {
					this.to   = new Point(this.from.x + size.x, this.from.y + size.y);
				} else {
					this.from = new Point(this.to.x   - size.x, this.to.y   - size.y);
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
		this.to.set(this.from.x + size.width, this.from.y + size.height);
	},
	/** @returns {boolean} */
	hasPoint : function (point, padding) {
		point   = Point.from(point);
		padding = padding || 0;
		return point.x != null && point.y != null
			&& atom.number.between(point.x, Math.min(this.from.x, this.to.x) + padding, Math.max(this.from.x, this.to.x) - padding, 'L')
			&& atom.number.between(point.y, Math.min(this.from.y, this.to.y) + padding, Math.max(this.from.y, this.to.y) - padding, 'L');
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
			rect = Rectangle.from(rect);
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
		this.to.snapToPixel().move(MinusOnePoint);
		return this;
	},
	/** @returns {string} */
	dump: function method (name) {
		return method.previous.call(this, name || 'Rectangle');
	},
	/** @returns {LibCanvas.Shapes.Polygon} */
	toPolygon: function () {
		return new Polygon(
			this.from.clone(), this.topRight, this.to.clone(), this.bottomLeft
		);
	}
});

/** @private */
Rectangle.from = function (object) {
	if (object == null) return null;

	return object instanceof Rectangle ? object : new Rectangle(object);
};