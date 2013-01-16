/*
---

name: "Size"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point

provides: Size

...
*/

/** @class Size */
var Size = LibCanvas.declare( 'LibCanvas.Size', 'Size', Point, {
	set: function method (size) {
		if (typeof size == 'object' && size.width != null) {
			this.x = Number(size.width);
			this.y = Number(size.height);

			return this;
		}
		return method.previous.apply( this, arguments );
	},

	get width  ( ) { return this.x },
	get height ( ) { return this.y },
	set width  (w) { this.x = w },
	set height (h) { this.y = h },

	/** @returns {object} */
	toObject: function () {
		return { width: this.x, height: this.y };
	}
});

/** @private */
Size.from = function (object) {
	if (object == null) return null;

	return object instanceof Size ? object : new Size(object);
};