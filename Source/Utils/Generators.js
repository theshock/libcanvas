
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
};