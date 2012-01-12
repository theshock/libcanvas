/*
---

name: "Geometry"

description: "Base for such things as Point and Shape"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Geometry

...
*/

var Geometry = declare( 'LibCanvas.Geometry',
/**
 * @lends LibCanvas.Geometry.prototype
 * @augments Class.Events.prototype
 */
{
	mixin: [ Events.Mixin ],
	own: {
		invoke: function (obj) {
			if (obj == null) throw new TypeError( 'element is not geometry' );

			return (typeof obj == 'object' && obj[0] instanceof this) ?
				obj[0] : (obj instanceof this ? obj : new this(obj));
		},
		from : function (obj) {
			return this(obj);
		}
	},
	proto: {
		initialize : function () {
			this.events = new Events(this);
			if (arguments.length) this.set.apply(this, arguments);
		},
		invertDirection: function (distance, reverse) {
			distance = Point( distance );
			var multi = reverse ? -1 : 1;
			return new Point(
				distance.x * multi,
				distance.y * multi
			);
		},
		move : function (distance, reverse) {
			this.events.fire('move', [this.invertDirection(distance, reverse)]);
			return this;
		},
		toString: Function.lambda('[object LibCanvas.Geometry]')
	}
});