/*
---

name: "App.LayerShift"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.LayerShift

...
*/

/** @class App.LayerShift */
declare( 'LibCanvas.App.LayerShift', {

	initialize: function (layer) {
		this.layer    = layer;
		this.shift    = new Point(0, 0);
		this.elementsShift = new Point(0, 0);
	},

	/**
	 * @private
	 * @property {Point}
	 */
	shift: null,

	/**
	 * @private
	 * @property {Point}
	 */
	elementsShift: null,

	/**
	 * @param {Point} shift
	 */
	addElementsShift: function (shift) {
		if (!shift) {
			shift = this.elementsShift.diff(this.shift);
		} else {
			shift = Point(shift);
		}
		var e = this.layer.elements, i = e.length;
		while (i--) e[i].addShift(shift);
		this.elementsShift.move(shift);
		return this;
	},

	/**
	 * @private
	 * @property {LibCanvas.Shapes.Rectangle}
	 */
	limitShift: null,

	/**
	 * @param {Rectangle} limitShift
	 */
	setLimitShift: function (limitShift) {
		this.limitShift = limitShift ? Rectangle(limitShift) : null;
		return this;
	},

	/**
	 * @param {Point} shift
	 */
	addShift: function ( shift, withElements ) {
		shift = new Point( shift );

		var limit = this.limitShift, current = this.shift;
		if (limit) {
			shift.x = atom.number.limit(shift.x, limit.from.x - current.x, limit.to.x - current.x);
			shift.y = atom.number.limit(shift.y, limit.from.y - current.y, limit.to.y - current.y);
		}

		current.move( shift );
		this.layer.dom.addShift( shift );
		this.layer.dom.canvas.ctx.translate( shift, true );
		if (withElements) this.addElementsShift( shift );
		return this;
	},

	/**
	 * @param {Point} shift
	 */
	setShift: function (shift, withElements) {
		return this.addShift( this.shift.diff(shift), withElements );
	},

	/**
	 * @returns {Point}
	 */
	getShift: function () {
		return this.shift;
	}
});