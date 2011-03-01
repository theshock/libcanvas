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

atom.Class.Mutators.Generators = function(properties) {
	var self = this;
	for (var i in properties) {
		(function (i, fn) {
			self.__defineGetter(i, function() {
				var pr = '_' + i;
				return pr in self ? self[pr] : (self[pr] = fn.call(self));
				
			});
		})(i, properties[i]);
	}
	properties = null;
};