// Number
Number.implement({
	/**
	 * Cast degrees to radians
	 * (90).degree() == Math.PI/2
	 */
	degree: function () {
		return this * Math.PI / 180;
	},
	/**
	 * Cast radians to degrees
	 * (Math.PI/2).getDegree() == 90
	 */
	getDegree: function () {
		return this / Math.PI * 180;
	},
	between: function (n1, n2, equals) {
		return (n1 <= n2) && (
			(equals == 'L'   && this == n1) ||
			(equals == 'R'   && this == n2) ||
			(  this  > n1    && this  < n2) ||
			([true, 'LR', 'RL'].contains(equals) && [n1, n2].contains(this))
		);
	}
});

// String
String.implement({
	repeat: function (times) {
		var s = this;
		new Number(times).times(function (t) {
			s += this;
		}, this);
		return s;
	},
	safeHTML: function () {
		return this.replace(/[<'&">]/g, function (symb) {
			return {
				'&'  : '&amp;',
				'\'' : '&#039;',
				'\"' : '&quot;',
				'<'  : '&lt;',
				'>'  : '&gt;'
			}[symb];
		});
	},
	nl2br: function () {
		return this.replaceAll('\n', '<br />\n');
	},
	replaceAll: function (find, replace) {
		return this.split(find).join(replace);
	},
	begins: function (w, caseInsensitive) {
		return (caseInsensitive) ? w == this.substr(0, w.length) :
			w.toLowerCase() == this.substr(0, w.length).toLowerCase();
	}
});

// Array
Array.implement({
	remove: function (index) {
		this.splice(index, 1);
		return this;
	},
	sum: function () {
		var s = 0;
		this.each(function (elem) {
			s += elem;
		});
		return s;
	},
	average: function () {
		return this.sum() / this.length;
	},
	firstReal: function () {
		for (var i = 0; i < this.length; i++) {
			if ($chk(this[i])) {
				return this[i];
			}
		}
		return null;
	},
	shuffle : function () {
		return this.sort(function () {
			return $random(0, 1) ? 1 : -1;
		});
	},
	sortByZIndex: function (reverse) {
		var getZ = function (elem) {
			return elem.getZIndex ? elem.getZIndex() : 0;
		};
		return this.sort(function ($0, $1) {
			var result = getZ($1) - getZ($0) >= 0 ? 1 : -1;
			return reverse ? -result : result;
		});
	}
});

var log = function () {
	try {
		console.log.apply(console, arguments);
	} catch (e) {}
};