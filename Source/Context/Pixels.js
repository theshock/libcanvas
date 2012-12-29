/*
---

name: "Context.Pixels"

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

provides: Context.Pixels

...
*/

new function () {

var toPoint = Point.from, toRectangle = Rectangle.from, size1x1 = new Size(1,1);


/** @class LibCanvas.Context.Pixels */
LibCanvas.declare( 'LibCanvas.Context.Pixels', {
	initialize: function (context) {
		this.context = context;
		this.ctx2d   = context.ctx2d;
	},

	// image data
	/** @returns {CanvasPixelArray} */
	createImageData : function (w, h) {
		if (w == null) {
			w = this.context.width;
			h = this.context.height;
		} else if (h == null) {
			if (w.width == null && w.height == null) {
				throw new TypeError('Wrong argument in the Context.createImageData');
			} else {
				h = w.height;
				w = w.width;
			}
		}

		return this.ctx2d.createImageData(w, h);
	},

	/** @returns {Context2D} */
	putImageData : function (a) {
		var put = {}, args, rect;

		switch (a.length) {
			case 1: {
				if (typeof a != 'object') {
					throw new TypeError('Wrong argument in the Context.putImageData');
				}

				a = a[0];
				put.image = a.image;
				put.from = toPoint(a.from);

				if (a.crop) put.crop = toRectangle(a.crop);
			} break;

			case 3: {
				put.image = a[0];
				put.from = new Point(a[1], a[2]);
			} break;

			case 7: {
				put.image = a[0];
				put.from = new Point(a[1], a[2]);
				put.crop = new Rectangle(a[3], a[4], a[5], a[6]);
			} break;

			default : throw new TypeError('Wrong args number in the Context.putImageData');
		}

		args = [put.image, put.from.x, put.from.y];

		if (put.crop) {
			rect = put.crop;
			atom.array.append(args, [rect.from.x, rect.from.y, rect.width, rect.height])
		}

		this.ctx2d.putImageData.apply(this.ctx2d, args);
		return this.context;
	},
	/** @returns {CanvasPixelArray} */
	getImageData : function (args) {
		var rect = toRectangle(args.length > 1 ? args : args[0]);

		return this.ctx2d.getImageData(rect.from.x, rect.from.y, rect.width, rect.height);
	},
	getPixels : function (args) {
		var
			rect = toRectangle(args.length > 1 ? args : args[0]),
			data = this.getImageData(rect).data,
			result = [],
			line = [];
		for (var i = 0, L = data.length; i < L; i+=4)  {
			line.push({
				r : data[i],
				g : data[i+1],
				b : data[i+2],
				a : data[i+3] / 255
			});
			if (line.length == rect.width) {
				result.push(line);
				line = [];
			}
		}
		return result;
	},

	getPixel: function (point) {
		var
			rect = new Rectangle(toPoint( point ), size1x1),
			data = slice.call(this.getImageData([rect]).data);

		data[3] /= 255;

		return new atom.Color(data);
	}

});

};
