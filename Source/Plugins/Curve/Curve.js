/*
---

name: "Plugins.Curve"

description: "Provides math base for bezier curves"

license:
- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: Plugins.Curve.Core

requires:
- LibCanvas
- Point

...
*/

/** @name LibCanvas.Plugins.Curve */
atom.declare( 'LibCanvas.Plugins.Curve', {

	step: 0.0001,

	initialize: function (data) {
		var Class = this.constructor.classes[data.points.length];

		if (Class) return new Class(data);

		this.setData(data);
	},

	setData: function (data) {
		this.from = data.from;
		this.to   = data.to;
		this.cp   = data.points;
	},

	getAngle: function (t) {
		var f;

		if (t < this.step) {
			f = t - this.step;
		} else {
			f  = t;
			t += this.step;
		}

		return this.getPoint(t).angleTo(this.getPoint(f));
	}

}).own({
	classes: {},

	addClass: function (points, Class) {
		this.classes[points] = Class;
	}
});