/*
---

name: "Plugins.Animation.Image"

description: ""

license:
- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides:
- Plugins.Animation
- Plugins.Animation.Image

requires:
- Plugins.Animation.Core

...
*/

/** @name Animation.Image */
atom.declare( 'LibCanvas.Plugins.Animation.Image', {
	initialize: function (animation) {
		this.bindMethods('update');

		if (animation instanceof Animation.Sheet) {
			animation = { sheet: animation };
		}
		if (!(animation instanceof Animation)) {
			animation = new Animation(animation);
		}

		this.buffer    = LibCanvas.buffer(animation.sheet.size, true);
		this.element   = atom.dom(this.buffer);
		this.animation = animation;
		this.element.controller = this;

		animation.events.add( 'update', this.update );
	},

	update: function (image) {
		this.buffer.ctx.clearAll();
		if (image) this.buffer.ctx.drawImage(image);
	}
}).own({
	element: function (animation) {
		return new this(animation).element;
	}
});