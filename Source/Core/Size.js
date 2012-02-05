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
var Size = declare( 'LibCanvas.Size', {
	parent: Point,

	prototype: {
		set: function (size) {
			if (typeof size == 'object' && size.width != null) {
				this.x = Number(size.width);
				this.y = Number(size.height);

				return this;
			}
			return Point.prototype.set.apply( this, arguments );
		},

		get width  ( ) { return this.x },
		get height ( ) { return this.y },
		set width  (w) { this.x = w },
		set height (h) { this.y = h },

		/** @returns {object} */
		toObject: function () {
			return { width: this.x, height: this.y };
		}
	}
});