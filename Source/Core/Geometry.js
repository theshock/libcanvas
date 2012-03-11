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

/**
 * @class
 * @name Geometry
 * @name LibCanvas.Geometry
 */
var Geometry = declare( 'LibCanvas.Geometry',
/**
 * @lends LibCanvas.Geometry.prototype
 * @augments Class.Events.prototype
 */
{
	own: {
		invoke: declare.castArguments,
		from : function (obj) {
			return this(obj);
		}
	},
	proto: {
		initialize : function () {
			if (arguments.length) this.set.apply(this, arguments);
		},
		cast: function (args) {
			return this.constructor.castArguments(args);
		}
	}
});