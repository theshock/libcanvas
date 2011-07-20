/*
---

name: "Inner.TimingFunctions"

description: "Animated Timing Functions"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Inner.TimingFunctions

inspiration:
  - "[MooTools](http://mootools.net)"

...
*/

var TimingFunctions = LibCanvas.Inner.TimingFunctions = function () {
	
return Class({
	Static: {
		_instance: null,
		get instance () {
			if (!this._instance) {
				this._instance = new this;
			}
			return this._instance;
		},
		count: function (fn, progress, params) {
			if (typeof fn == 'string') fn = fn.split('-');
			if (typeof (this.instance[fn[0]]) != 'function') {
				throw new TypeError('No timing function «' + fn[0] + '»');
			}
			var In = fn.contains('in'), Out = fn.contains('out');
			if (In && !Out) {
				return this.easeIn(fn[0], progress, params);
			} else if (!In && Out) {
				return this.easeOut(fn[0], progress, params);
			} else {
				fn = fn.filter(function (name) {
					return name != 'in' && name != 'out';
				});
				if (fn.length < 2) fn[1] = fn[0];
				return this.easeInOut(fn, progress, params);
			}
		},
		easeIn: function(fn, progress, params){
			return this.instance[fn](progress, params);
		},
		easeOut: function(fn, progress, params){
			return 1 - this.instance[fn](1 - progress, params);
		},
		easeInOut: function(fn, progress, params){
			return (progress <= 0.5) ?
				this.instance[fn[0]](2 * progress, params) / 2 :
				(2 - this.instance[fn[1]](2 * (1 - progress), params)) / 2;
		}
	},

	linear: function (p) {
		return p;
	},

	pow: function(p, x){
		return Math.pow(p, x && x[0] || 6);
	},

	expo: function(p){
		return Math.pow(2, 8 * (p - 1));
	},

	circ: function(p){
		return 1 - Math.sin(Math.acos(p));
	},

	sine: function(p){
		return 1 - Math.sin((1 - p) * Math.PI / 2);
	},

	back: function(p, x){
		x = x && x[0] || 1.618;
		return Math.pow(p, 2) * ((x + 1) * p - x);
	},

	bounce: function(p){
		var value;
		for (var a = 0, b = 1; 1; a += b, b /= 2){
			if (p >= (7 - 4 * a) / 11){
				value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
				break;
			}
		}
		return value;
	},

	elastic: function(p, x){
		return Math.pow(2, 10 * --p) * Math.cos(20 * p * Math.PI * (x && x[0] || 1) / 3);
	}
}).implement(
	['quad', 'cubic', 'quart', 'quint']
		.associate(function(name, i){
			return function (p) {
				return Math.pow(p, i + 2);
			}
		})
);

}();