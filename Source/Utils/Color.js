/*
---

name: "Utils.Color"

description: "Provides Color class"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Utils.Color

...
*/

new function () {

var math = Math;

LibCanvas.namespace('Utils').Color = atom.Class({
	Static: {
		isColorString : function (string) {
			if (typeof string != 'string') return false;
			return string in this.colorNames ||
			       string.match(/^#\w{3,6}$/) ||
			       string.match(/^rgba?\([\d, ]+\)$/);
		},
		colorNames: {
			white:  '#ffffff',
			silver: '#c0c0c0',
			gray:   '#808080',
			black:  '#000000',
			red:    '#ff0000',
			maroon: '#800000',
			yellow: '#ffff00',
			olive:  '#808000',
			lime:   '#00ff00',
			green:  '#008000',
			aqua:   '#00ffff',
			teal:   '#008080',
			blue:   '#0000ff',
			navy:   '#000080',
			fuchsia:'#ff00ff',
			purple: '#800080',
			orange: '#ffa500'
		}
	},
	r: 0,
	g: 0,
	b: 0,
	initialize: function (value) {
		var rgb = value;
		if (arguments.length == 3) {
			rgb = arguments;
		} else if (!Array.isArray(value)) {
			if (typeof value != 'string') {
				throw new TypeError('Unknown value type: ' + atom.typeOf(value));
			}
			value = value.toLowerCase();
			
			value = this.self.colorNames[value] || value;
			var hex = value.match(/^#(\w{1,2})(\w{1,2})(\w{1,2})$/);
			if (hex) {
				rgb = hex.slice(1).map(function (part) {
					if (part.length == 1) part += part;
					return parseInt(part, 16);
				});
			} else {
				rgb = value.match(/(\d{1,3})/g).map(function (value) {
					return value - 0;
				});
				if (rgb.length < 3) {
					throw new TypeError('Wrong value format: ' + atom.toArray(arguments));
				}
			}
		}
		this.r = rgb[0];
		this.g = rgb[1];
		this.b = rgb[2];
	},
	toArray: function () {
		return [this.r, this.g, this.b];
	},
	toString: function (type) {
		var arr = this.toArray();
		return type == 'hex' ?
			'#' + arr.map(function (color) {
				var bit = (color - 0).toString(16)
				return bit.length == 1 ? '0' + bit : bit;
			}).join('')
			: 'rgb(' + arr + ')';
	},
	diff: function (color) {
		if (! (color instanceof this.self)) color = this.self.factory(arguments);
		var result = [
			color.r - this.r,
			color.g - this.g,
			color.b - this.b
		];
		return result;
	},
	shift: function (array) {
		var clone = this.clone();
		clone.r += math.round(array[0]);
		clone.g += math.round(array[1]);
		clone.b += math.round(array[2]);
		return clone;
	},
	dump: function () {
		return '[Color(' + this + ')]';
	},
	clone: function () {
		return new this.self(this.r, this.g, this.b);
	}
});

}();