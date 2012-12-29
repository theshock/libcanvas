/*
---

name: "Context.DrawImage"

description: "LibCanvas.Context2D adds new canvas context '2d-libcanvas'"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Size
	- Shapes.Rectangle
	- Shapes.Circle

provides: Context.DrawImage

...
*/

new function () {

var toPoint = Point.from, toRectangle = Rectangle.from;

/** @class LibCanvas.Context.DrawImage */
LibCanvas.declare( 'LibCanvas.Context.DrawImage', {
	initialize: function (context) {
		this.context = context;
		this.ctx2d   = context.ctx2d;
	},

	drawImage: function (args) {
		var a, center, from, draw, crop, scale, image, pivot, angle;

		if (this.checkNonObject(args)) return;

		a = args[0];

		image  = a.image;
		angle  = a.angle;
		scale  = a.scale  && toPoint(a.scale);
		center = a.center && toPoint(a.center);
		from   = a.from   && toPoint(a.from);
		draw   = a.draw   && toRectangle(a.draw);
		crop   = a.crop   && toRectangle(a.crop);

		if (! atom.dom.isElement(image) ) throw new TypeError('Wrong image in Context.DrawImage');
		if (! (center || from || draw)  ) throw new TypeError('Wrong arguments in Context.DrawImage');

		pivot = this.getTransformPivot(
			angle, scale, image,
			center, from, draw
		);

		if (pivot) this.transform(pivot, angle, scale);
		draw ?
			this.drawRect (image, draw, crop  , a.optimize) :
			this.drawPoint(image, from, center, a.optimize);
		if (pivot) this.ctx2d.restore();

		return this.context;
	},

	/** @private */
	run: function (array) {
		this.ctx2d.drawImage.apply( this.ctx2d, array );
	},
	/** @private */
	transform: function (center, angle, scale) {
		this.ctx2d.save();
		if (angle) this.context.rotate(angle, center);
		if (scale) this.context.scale (scale, center);
	},
	/** @private */
	checkNonObject: function (args) {
		var image = args[0], length = args.length, target;
		if (length > 2) {
			this.run(args);
			return true;
		}
		if (length == 2) {
			target = args[1];

			if (target instanceof Point) {
				this.drawPoint(image, target);
				return true;
			}
			if (target instanceof Rectangle) {
				this.drawRect(image, target);
				return true;
			}

			throw new Error('Unknown second argument in Context.DrawImage');
		}

		if (length == 0) {
			throw new Error('Empty arguments in Context.DrawImage');
		}

		if (atom.dom.isElement(image)) {
			this.ctx2d.drawImage(image, 0, 0);
			return true;
		}

		return false;
	},
	/** @private */
	drawPoint: function (image, from, center, optimize) {
		var
			point = center || from,
			fromX = point.x,
			fromY = point.y;

		if (center) {
			fromX -= image.width  / 2;
			fromY -= image.height / 2;
		}

		if (optimize) {
			fromX = Math.round(fromX);
			fromY = Math.round(fromY);
		}

		this.ctx2d.drawImage(image, fromX, fromY);
	},
	/** @private */
	drawRect: function (image, rect, crop, optimize) {
		var deltaX, deltaY, fromX, fromY;

		if (crop) {
			this.ctx2d.drawImage( image,
				crop.from.x, crop.from.y, crop.width, crop.height,
				rect.from.x, rect.from.y, rect.width, rect.height
			);
			return;
		}

		if (optimize) {
			fromX  = Math.round(rect.from.x);
			fromY  = Math.round(rect.from.y);
			deltaX = Math.abs(rect.width  - image.width );
			deltaY = Math.abs(rect.height - image.width );

			if (deltaX < 1.1 && deltaY < 1.1) {
				this.ctx2d.drawImage(image, fromX, fromY);
			} else {
				this.ctx2d.drawImage(image, fromX, fromY,
					Math.round(rect.width),
					Math.round(rect.height)
				);
			}
			return;
		}

		this.ctx2d.drawImage( image,
			rect.from.x, rect.from.y,
			rect.width , rect.height
		);
	},
	/** @private */
	getTransformPivot: function (angle, scale, image, center, from, draw) {
		if ( !angle && (!scale || (scale.x == 1 && scale.y == 1)) ) return null;

		if (center) return center;
		if ( draw ) return draw.center;

		return new Point(from.x + image.width/2, from.y + image.height/2);
	}
});

};
