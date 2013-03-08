/*
 ---

 name: "ImageBuilder"

 description: "Plugin, that compile image from parts"

 license:
 - "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
 - "[MIT License](http://opensource.org/licenses/mit-license.php)"

 authors:
 - Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

 provides: Plugins.ImageBuilder

 requires:
 - LibCanvas
 - Point
 - Shapes.Rectangle

 ...
 */

/** @class ImageBuilder */
var ImageBuilder = LibCanvas.declare(
	'LibCanvas.Plugins.ImageBuilder', 'ImageBuilder', {
		ctx     : null,
		shape   : null,
		images  : [
			0, 1, 2,
			3, 4, 5,
			6, 7, 8
		],

		/**
		 * @param data
		 * @param data.source  - image
		 * @param data.widths  - [ left, center, right ]
		 * @param data.heights - [ top, middle, bottom ]
		 */
		initialize: function (data) {
			this.cropImage( data );
		},

		/** @private */
		renderSingle: function (image, xDir, yDir) {
			if (image != null) this.ctx.drawImage({
				image: image,
				from: this.countShape( xDir, yDir ).from
			});

			return this;
		},
		/** @private */
		renderRepeated: function (image, xDir, yDir) {
			if (image != null) {
				var pattern = this.ctx.createPattern( image, 'repeat' );

				var shape = this.countShape(xDir, yDir);
				this.ctx
					.translate(shape.from)
					.fill( new Rectangle(new Point(0,0), shape.size), pattern)
					.translate(shape.from, true);
			}
			return this;
		},
		/** @private */
		countShape: function (xDir, yDir) {
			var
				size = this.shape.size,
				from = new Point(0,0),
				to   = new Point(0,0);

			from.x = xDir == 'left'   ? 0 :
				this.countBasis( xDir == 'center' ? 'left' : 'right' );

			from.y = yDir == 'top'    ? 0 :
				this.countBasis( yDir == 'middle' ? 'top' : 'bottom' );

			to.x   = xDir == 'right'  ? size.width  :
				this.countBasis( xDir == 'center' ? 'right' : 'left' );

			to.y   = yDir == 'bottom' ? size.height :
				this.countBasis( yDir == 'middle' ? 'bottom' : 'top' );

			return new Rectangle( from, to ).move( this.shape );
		},
		/** @private */
		countBasis: function (basis) {
			var images = this.images, size = this.shape.size;

			switch (basis) {
				case 'left'  : return               images[0].width;
				case 'right' : return size.width  - images[2].width;
				case 'top'   : return               images[0].height;
				case 'bottom': return size.height - images[6].height;
				default: throw new TypeError('Wrong basis: ' + basis);
			}
		},
		/** @private */
		renderParts: function () {
			var images = this.images;
			this
				.renderRepeated( images[1], 'center', 'top'    )
				.renderRepeated( images[3], 'left'  , 'middle' )
				.renderRepeated( images[4], 'center', 'middle' )
				.renderRepeated( images[5], 'right' , 'middle' )
				.renderRepeated( images[7], 'center', 'bottom' )
				.renderSingle  ( images[0], 'left'  , 'top'    )
				.renderSingle  ( images[2], 'right' , 'top'    )
				.renderSingle  ( images[6], 'left'  , 'bottom' )
				.renderSingle  ( images[8], 'right' , 'bottom' );
		},
		/** @private */
		cropImage: function (data) {
			var w, h, x, y, width, height,
				images  = [],
				widths  = data.widths,
				heights = data.heights;

			for (y = 0, h = 0; h < heights.length; h++) {
				height = heights[h];
				for (x = 0, w = 0; w < widths.length; w++) {
					width = widths[w];

					images.push(this.createCroppedImage( data.source,
						new Rectangle(x,y,width,height)
					));

					x += width;
				}
				y += height;
			}

			this.images = images;
		},
		/** @private */
		createCroppedImage: function (source, shape) {
			var buffer = LibCanvas.buffer( shape.size, true );

			buffer.ctx.drawImage({
				image: source,
				draw : buffer.ctx.rectangle,
				crop : shape
			});

			return buffer;
		},

		renderTo: function (ctx, shape) {
			this.ctx   = ctx;
			this.shape = shape;
			this.renderParts();
		}
	}
);

/** @class ImageBuilder.Horisontal */
atom.declare( 'LibCanvas.Plugins.ImageBuilder.Horisontal', ImageBuilder, {
	images: [ 0, 1, 2 ],
	/** @private */
	countBasis: function (basis) {
		var images = this.images, size = this.shape.size;

		switch (basis) {
			case 'left'  : return images[0].width;
			case 'right' : return size.width  - images[2].width;
			case 'top'   : return 0;
			case 'bottom': return size.height;
			default: throw new TypeError('Wrong basis: ' + basis);
		}
	},
	/** @private */
	renderParts: function () {
		var images = this.images;
		this
			.renderRepeated( images[1], 'center', 'middle' )
			.renderSingle  ( images[0], 'left'  , 'middle' )
			.renderSingle  ( images[2], 'right' , 'middle' );
	},
	/** @private */
	cropImage: function (data) {
		var w, x, width,
			images  = [],
			widths  = data.widths;

		this.height = data.source.height;

		for (x = 0, w = 0; w < widths.length; w++) {
			width = widths[w];

			images.push(this.createCroppedImage( data.source,
				new Rectangle(x,0,width,this.height)
			));

			x += width;
		}

		this.images = images;
	}
});

/** @class ImageBuilder.Vertical */
atom.declare( 'LibCanvas.Plugins.ImageBuilder.Vertical', ImageBuilder, {
	images: [ 0, 1, 2 ],
	/** @private */
	countBasis: function (basis) {
		var images = this.images, size = this.shape.size;

		switch (basis) {
			case 'left'  : return 0;
			case 'right' : return size.width;
			case 'top'   : return images[0].height;
			case 'bottom': return size.height - images[2].height;
			default: throw new TypeError('Wrong basis: ' + basis);
		}
	},
	/** @private */
	renderParts: function () {
		var images = this.images;
		this
			.renderRepeated( images[1], 'center', 'middle' )
			.renderSingle  ( images[0], 'center', 'top'    )
			.renderSingle  ( images[2], 'center', 'bottom' );
	},
	/** @private */
	cropImage: function (data) {
		var h, y, height,
			images  = [],
			heights = data.heights;

		this.width = data.source.width;

		for (y = 0, h = 0; h < heights.length; h++) {
			height = heights[h];

			images.push(this.createCroppedImage( data.source,
				new Rectangle(0,y,this.width,height)
			));

			y += height;
		}

		this.images = images;
	}
});