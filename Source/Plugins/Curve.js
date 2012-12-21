/*
 ---

 name: "Plugins.Curve"

 description: "Provides math base for bezier curves"

 license:
 - "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
 - "[MIT License](http://opensource.org/licenses/mit-license.php)"

 authors:
 - Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

 provides: Plugins.Curve

 requires:
 - LibCanvas
 - Point

 ...
 */

/** @name LibCanvas.Plugins.Curve */
atom.declare( 'LibCanvas.Plugins.Curve', {

	step: 0.0001,

	initialize: function (data) {
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

});

/** @name LibCanvas.Plugins.Curve.Quadratic */
atom.declare( 'LibCanvas.Plugins.Curve.Quadratic', LibCanvas.Plugins.Curve, {

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

/** @name LibCanvas.Plugins.Curve.Qubic */
atom.declare( 'LibCanvas.Plugins.Curve.Qubic', LibCanvas.Plugins.Curve, {

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