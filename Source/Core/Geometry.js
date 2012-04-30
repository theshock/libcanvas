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

/** @class Geometry */
var Geometry = declare( 'LibCanvas.Geometry', {
	initialize : function () {
		if (arguments.length) this.set.apply(this, arguments);
	},
	cast: function (args) {
		return this.constructor.castArguments(args);
	}
}).own({
	invoke: declare.castArguments,
	from : function (obj) {
		return this(obj);
	}
});