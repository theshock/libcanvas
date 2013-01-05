/*
---

name: "Plugins.Animation.Frames"

description: ""

license:
- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides:
- Plugins.Animation
- Plugins.Animation.Frames

requires:
- LibCanvas
- Plugins.Animation.Core

...
*/

/** @class Animation.Frames */
atom.declare( 'LibCanvas.Plugins.Animation.Frames', {
	sprites: [],

	initialize: function (image, width, height) {
		if (image == null) throw new TypeError('`image` cant be null');

		this.sprites = [];
		this.image   = image;
		this.size    = new Size(
			width  == null ? image.width  : width ,
			height == null ? image.height : height
		);

		this.prepare();
	},

	get length () {
		return this.sprites.length;
	},

	/** @private */
	prepare: function () {
		var x, y,
			im = this.image,
			w  = this.size.width,
			h  = this.size.height;

		for     (y = 0; y <= im.height - h; y += h) {
			for (x = 0; x <= im.width  - w; x += w) {
				this.sprites.push( UtilsImage.sprite(im, new Rectangle(x, y, w, h)) );
			}
		}

		if (!this.sprites.length) {
			throw new TypeError('Animation is empty');
		}
	},

	get: function (id) {
		var sprite = this.sprites[id];

		if (!sprite) {
			throw new Error('No sprite with such id: ' + id);
		}

		return sprite;
	}
});