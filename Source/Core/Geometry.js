/*
---

name: "Geometry"

description: "Base for such things as Point and Shape"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Bindable

provides: Geometry

...
*/

LibCanvas.Geometry = atom.Class({
	Implements: [atom.Class.Events],
	Static: {
		from : function (obj) {
			return obj[0] instanceof this ? obj[0] : obj instanceof this ? obj : new this(obj);
		}
	},
	initialize : function () {
		if (arguments.length) this.set.apply(this, arguments);
	},
	invertDirection: function (distance, reverse) {
		var multi = reverse ? -1 : 1;
		return {
			x : distance.x * multi,
			y : distance.y * multi
		};
	},
	move : function (distance, reverse) {
		this.fireEvent('move', [this.invertDirection(distance, reverse)]);
		return this;
	}
});