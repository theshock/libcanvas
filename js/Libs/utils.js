/**
 * Cast degrees to radians
 * (90).degree() == Math.PI/2
 */
Number.prototype.degree = function () {
	return this * Math.PI / 180;
};
/**
 * Cast radians to degrees
 * (Math.PI/2).getDegree() == 90
 */
Number.prototype.getDegree = function () {
	return this / Math.PI * 180;
};

Number.prototype.between = function (n1, n2, equals) {
	return (n1 <= n2) && (
		(equals == 'L'   && this == n1) ||
		(equals == 'R'   && this == n2) ||
		(  this  > n1    && this  < n2) ||
		([true, 'LR', 'RL'].contains(equals) && [n1, n2].contains(this))
	);
};

// String
String.prototype.repeat = function (times) {
	var s = this;
	new Number(times).times(function (t) {
		s += this;
	}, this);
	return s;
};

String.prototype.template = function (tpl) {
	return this.replace(/{([a-z0-9_]+)}/ig, function (full, index) {
		return tpl[index];
	})
};
String.prototype.safeHTML = function () {
	return this.replace(/[<'&">]/g, function (symb) {
		return {
			'&'  : '&amp;',
			'\'' : '&#039;',
			'\"' : '&quot;',
			'<'  : '&lt;',
			'>'  : '&gt;'
		}[symb];
	});
};
String.prototype.nl2br = function () {
	return this.replaceAll('\n', '<br />\n');
};
String.prototype.replaceAll = function (find, replace) {
	return this.split(find).join(replace);
};

// Array
Array.prototype.remove = function (index) {
	this.splice(index, 1);
	return this;
};
Array.prototype.sum = function () {
	var s = 0;
	this.each (function (elem) {
		s += elem;
	});
	return s;
};
Array.prototype.average = function () {
	return this.sum() / this.length;
};
Array.prototype.firstReal = function () {
	for (var i = 0; i < this.length; i++) {
		if ($chk(this[i])) {
			return this[i];
		}
	}
	return null;
};

