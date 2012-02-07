/*
---

name: "Utils.Image"

description: "Provides some Image extensions"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Shapes.Rectangle

provides: Utils.Image

...
*/
// <image> tag
atom.implement(HTMLImageElement, {
	// наверное, лучше использовать createPattern
	createSprite: function (rect) {
		if (rect.width <= 0 || rect.height <= 0) {
			throw new TypeError('Wrong rectangle size');
		}

		var buf = new Buffer(rect.width, rect.height, true),
			xShift, yShift, x, y, xMax, yMax, crop, size;

		// если координаты выходят за левый/верхний край картинки
		{
			if (rect.from.x < 0) xShift = (rect.from.x.abs() / rect.width ).ceil();
			if (rect.from.y < 0) yShift = (rect.from.y.abs() / rect.height).ceil();
			if (xShift || yShift) {
				rect = rect.clone().move({
					x: xShift * this.width,
					y: yShift * this.height
				});
			}
		}

		// для того, чтобы была возможность указывать ректангл, выходящий
		// за пределы картинки. текущая картинка повторяется как паттерн
		xMax = (rect.to.x / this.width ).ceil();
		yMax = (rect.to.y / this.height).ceil();
		for (y = yMax; y-- > 0;) for (x = xMax; x-- > 0;) {
			var current = new Point(x * this.width, y * this.height);
			var from = current.clone();
			var to   = from.clone().move([this.width, this.height]);

			if (from.x < rect.from.x) from.x = rect.from.x;
			if (from.y < rect.from.y) from.y = rect.from.y;
			if (  to.x > rect. to .x)   to.x = rect. to .x;
			if (  to.y > rect. to .y)   to.y = rect. to .y;
			
			crop = new Rectangle(from, to);
			size = crop.size;
			crop.from.x %= this.width;
			crop.from.y %= this.height;
			crop.size    = size;

			if (x) current.x -= rect.from.x;
			if (y) current.y -= rect.from.y;

			if (size.width && size.height) buf.ctx.drawImage({
				image : this,
				crop  : crop,
				draw  : new Rectangle({
					from: current,
					size: size
				})
			});
		}

		return buf;
	},
	toCanvas: function () {
		var cache = (this.spriteCache = (this.spriteCache || {}));
		if (!cache[0]) {
			cache[0] = Buffer(this, true)
				.ctx.drawImage(this)
				.canvas;
		}
		return cache[0];
	},
	sprite : function () {
		if (!this.isLoaded()) throw new Error('Not loaded in Image.sprite, logged');

		if (arguments.length) {
			var rect  = Rectangle(arguments),
				index = [rect.from.x,rect.from.y,rect.width,rect.height].join('.'),
				cache = (this.spriteCache = (this.spriteCache || {}));
			if (!cache[index]) cache[index] = this.createSprite(rect);
			return cache[index];
		} else {
			return this.toCanvas();
		}
	},
	isLoaded : function () {
		if (!this.complete)  return false;
		return (this.naturalWidth == null) || !!this.naturalWidth;
	}
});
	// mixin from image
atom.implement(HTMLCanvasElement, {
	createSprite : HTMLImageElement.prototype.createSprite,
	sprite   : HTMLImageElement.prototype.sprite,
	isLoaded : function () { return true; },
	toCanvas : function () { return this; }
});