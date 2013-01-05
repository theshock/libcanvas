/*
---

name: "Plugins.Curve.Quadratic"

description: "Provides math base for bezier curves"

license:
- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides:
- Plugins.Curve
- Plugins.Curve.Quadratic

requires:
- Plugins.Curve.Core

...
*/

/** @name LibCanvas.Plugins.Curve.Quadratic */
atom.declare( 'LibCanvas.Plugins.Curve.Quadratic', LibCanvas.Plugins.Curve, {

	initialize: function (data) {
		this.setData(data);
	},

	getPoint: function (t) {
		var
			from = this.from,
			to   = this.to,
			point= this.cp[0],
			i    = 1 - t;

		return new Point(
			i*i*from.x + 2*t*i*point.x + t*t*to.x,
			i*i*from.y + 2*t*i*point.y + t*t*to.y
		);
	}

});

LibCanvas.Plugins.Curve.addClass(1, LibCanvas.Plugins.Curve.Quadratic);