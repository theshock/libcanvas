/*
---

name: "Scene.Mouse.Event"

description: "LibCanvas.Scene.Mouse"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Scene

provides: Scene.MouseEvent

...
*/

Scene.MouseEvent = Class(
/**
 * @lends LibCanvas.Scene.MouseEvent#
 */
{
	/** @property {LibCanvas.Point} */
	offset: null,
	/** @property {LibCanvas.Point} */
	deltaOffset: null,
	/** @property {number} */
	delta: 0,

	/** @private */
	falling: false,

	/** @constructs */
	initialize: function (type, original) {
		this.type     = type;
		this.original = original;
		this.extend([ 'offset', 'deltaOffset', 'delta', 'button' ]);
	},

	/** @returns {Scene.MouseEvent} */
	prevent: function () {
		this.original.preventDefault();
		return this;
	},

	/** @private */
	extend: function (props) {
		for (var i = props.length; i--;) {
			var prop = props[i];
			if ( this.original[prop] != null ) {
				this[prop] = this.original[prop];
			}
		}
		return this;
	},

	/** @private */
	checkFalling: function () {
		var value = this.falling;
		this.falling = false;
		return value;
	},

	/** @returns {LibCanvas.Scene.MouseEvent} */
	fall: function () {
		this.falling = true;
		return this;
	},

	/** @deprecated */
	stop: function () {
		//console.error('deprecated');
		return this;
	}
});