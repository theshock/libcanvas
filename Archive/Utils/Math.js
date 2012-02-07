/*
---

name: "Utils.Math"

description: "Helpers for basic math operations, such as degree, hypotenuse from two cathetus, etc"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

provides: Utils.Math

...
*/

// Number
(function () {

	var degreesCache = {}, d360;

	atom.implement(Number, {
		/**
		 * Cast degrees to radians
		 * (90).degree() == Math.PI/2
		 */
		degree: function () {
			return this in degreesCache ? degreesCache[this] :
				this * Math.PI / 180;
		},
		/**
		 * Cast radians to degrees
		 * (Math.PI/2).getDegree() == 90
		 */
		getDegree: function (round) {
			return arguments.length == 0 ?
				this / Math.PI * 180 :
				this.getDegree().round(round);
		},
		normalizeAngle : function () {
			var num  = this % d360;
			return num < 0 ? num + d360 : num;
		},
		normalizeDegree : function (base) {
			return this
				.getDegree()
				.round(base || 0)
				.degree()
				.normalizeAngle();
		},

		toSeconds: function () {
			return this / 1000;
		},
		toMinutes: function () {
			return this / 60 / 1000;
		},
		toHours: function () {
			return this / 60 / 60 / 1000;
		},

		seconds: function () {
			return this * 1000;
		},
		minutes: function () {
			return this * 60 * 1000;
		},
		hours: function () {
			return this * 60 * 60 * 1000;
		}

	});

	degreesCache = [0, 45, 90, 135, 180, 225, 270, 315, 360]
		.associate(function (num) {
			return num.degree();
		});
	d360 = degreesCache[360];

})();

atom.extend(Math, {
	hypotenuse: function (cathetus1, cathetus2)  {
		return (cathetus1*cathetus1 + cathetus2*cathetus2).sqrt();
	},
	cathetus: function (hypotenuse, cathetus2)  {
		return (hypotenuse*hypotenuse - cathetus2*cathetus2).sqrt();
	}
});