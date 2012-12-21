/*
---

name: "Plugins.Image"

description: "Provides some Image extensions"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Shapes.Rectangle

provides: Plugins.Image

...
*/

var UtilsImage = atom.declare( 'LibCanvas.Utils.Image', {
	canvasCache: null,

	initialize: function (image) {
		this.image = image;
		this.cache = {};
	},

	/**
	 * @param {Rectangle} rect
	 * #todo: use createPattern
	 */
	createSprite: function (rect) {
		var image, buf, xShift, yShift, x, y, xMax, yMax, crop, size, current, from, to;

		if (rect.width <= 0 || rect.height <= 0) {
			throw new TypeError('Wrong rectangle size');
		}

		image = this.image;
		buf = LibCanvas.buffer(rect.width, rect.height, true);

		// если координаты выходят за левый/верхний край картинки
		if (rect.from.x < 0) xShift = Math.ceil(Math.abs(rect.from.x) / rect.width );
		if (rect.from.y < 0) yShift = Math.ceil(Math.abs(rect.from.y) / rect.height);
		if (xShift || yShift) {
			rect = rect.clone().move(new Point(
				xShift * image.width,
				yShift * image.height
			));
		}

		// для того, чтобы была возможность указывать ректангл, выходящий
		// за пределы картинки. текущая картинка повторяется как паттерн
		xMax = Math.ceil(rect.to.x / image.width );
		yMax = Math.ceil(rect.to.y / image.height);
		for (y = yMax; y-- > 0;) for (x = xMax; x-- > 0;) {
			current = new Point(x * image.width, y * image.height);
			from = current.clone();
			to   = from.clone().move([image.width, image.height]);

			if (from.x < rect.from.x) from.x = rect.from.x;
			if (from.y < rect.from.y) from.y = rect.from.y;
			if (  to.x > rect. to .x)   to.x = rect. to .x;
			if (  to.y > rect. to .y)   to.y = rect. to .y;

			crop = new Rectangle(from, to);
			size = crop.size;
			crop.from.x %= image.width;
			crop.from.y %= image.height;
			crop.size    = size;

			if (x) current.x -= rect.from.x;
			if (y) current.y -= rect.from.y;

			if (size.width && size.height) buf.ctx.drawImage({
				image : image,
				crop  : crop,
				draw  : new Rectangle( current, size )
			});
		}

		return buf;
	},

	toCanvas: function () {
		var cache = this.canvasCache;

		if (!cache) {
			cache = this.canvasCache = LibCanvas.buffer(this, true);
			cache.ctx.drawImage(this);
		}
		return cache;
	},

	isLoaded: function () {
		return this.constructor.isLoaded( this.image );
	},

	sprite: function () {
		if (!this.isLoaded()) throw new Error('Not loaded in Image.sprite, logged');

		if (arguments.length) {
			var
				rect  = Rectangle(arguments),
				index = rect.dump(),
				cache = this.cache[index];

			if (!cache) {
				cache = this.cache[index] = this.createSprite(rect);
			}
			return cache;
		} else {
			return this.toCanvas();
		}
	}
});

UtilsImage.own({
	isLoaded : function (image) {
		return image.complete && ( (image.naturalWidth == null) || !!image.naturalWidth );
	},

	sprite: function (image, rectangle) {
		return this.mix(image).sprite(rectangle);
	},

	toCanvas: function (image) {
		return this.mix(image).toCanvas();
	},

	mix: function (image) {
		var key = 'libcanvas.image';

		if (!image[key]) {
			image[key] = new this(image);
		}

		return image[key];
	}
});