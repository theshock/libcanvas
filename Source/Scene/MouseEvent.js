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

	/** @constructs */
	initialize: function (type, original) {
		this.type     = type;
		this.original = original;
		this.extend([ 'offset', 'deltaOffset', 'delta' ]);
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
	stopped: false,

	/** @returns {LibCanvas.Scene.MouseEvent} */
	stop: function () {
		this.stopped = true;
		this.original._stopped = true;
		return this;
	}
});