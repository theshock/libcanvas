/*
---

name: "atom.Class.Mutators.Generators"

description: "Provides Generators mutator"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

provides: atom.Class.Mutators.Generators

...
*/

new function () {

var getter = function (obj, key, fn) {
	return function() {
		var pr = '_' + key;
		return pr in obj ? obj[pr] : (obj[pr] = fn.call(obj));
	};
};

atom.Class.Mutators.Generators = function(properties) {
	for (var i in properties) this.__defineGetter(i, getter(this, i, properties[i]));
};

};