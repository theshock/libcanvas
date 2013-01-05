/*
---

name: "Plugins.Curve.Qubic"

description: "Provides math base for bezier curves"

license:
- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides:
- Plugins.Curve
- Plugins.Curve.Qubic

requires:
- Plugins.Curve.Core

...
*/

/** @name LibCanvas.Plugins.Curve.Qubic */
atom.declare( 'LibCanvas.Plugins.Curve.Qubic', LibCanvas.Plugins.Curve, {

	initialize: function (data) {
		this.setData(data);
	},

	getPoint: function (t) {
		var
			from = this.from,
			to   = this.to,
			cp   = this.cp,
			i    = 1 - t;

		return new Point(
			i*i*i*from.x + 3*t*i*i*cp[0].x + 3*t*t*i*cp[1].x + t*t*t*to.x,
			i*i*i*from.y + 3*t*i*i*cp[0].y + 3*t*t*i*cp[1].y + t*t*t*to.y
		);
	}

});

LibCanvas.Plugins.Curve.addClass(2, LibCanvas.Plugins.Curve.Qubic);