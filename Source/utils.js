/*
---
description: Extends native prototypes with several useful functions

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides:
- Number.degree
- Number.getDegree
- Number.normalizeAngle
- $log
- $equals
- Math.hypotenuse
- Math.cathetus
- parseUri
*/

// Number
(function () {


var degreesCache = {};

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
	}
});

for (var degree in [0, 45, 90, 135, 180, 225, 270, 315, 360].toKeys()) {
	degreesCache[degree] = (degree * 1).degree();
}
var d360 = degreesCache[360];

})();

// <image> tag
atom.implement(HTMLImageElement, {
	sprite : function () {
		if (!this.isLoaded()) {
			atom.log('Not loaded in Image.sprite: ', this);
			throw 'Not loaded in Image.sprite, logged';
		}
		var buf;
		this.spriteCache = this.spriteCache || {};
		if (arguments.length) {
			var rect = LibCanvas.Shapes.Rectangle.factory(arguments);
			var index = [rect.from.x,rect.from.y,rect.getWidth(),rect.getHeight()].join('.');
			buf = this.spriteCache[index]
			if (!buf) {
				buf = LibCanvas.Buffer(rect.getWidth(), rect.getHeight());
				var bigBuf = LibCanvas.Buffer(this.width*2, this.height*2);
				for (var y = 0; y < 2; y++) {
					for (var x = 0; x < 2; x++) {
						bigBuf.getContext('2d-libcanvas').drawImage({
							image : this,
							from : [this.width*x,this.height*y]
						});
					}
				}
				buf.getContext('2d-libcanvas').drawImage({
					image : bigBuf,
					crop  : rect,
					draw  : [0,0,rect.getWidth(),rect.getHeight()]
				});
				bigBuf.getContext('2d-libcanvas').clearAll();
				this.spriteCache[index] = buf;
			}

		} else {
			buf = this.spriteCache[0];
			if (!buf) {
				this.spriteCache[0] = buf = LibCanvas.Buffer(this.width, this.height);
				buf.getContext('2d-libcanvas').drawImage(this, 0, 0);
			}
		}
		return buf;
	},
	isLoaded : function () {
		if (!this.complete) return false;
		return !Object.isDefined(this.naturalWidth) || this.naturalWidth; // browsers
	}
});

// else
var $log = function () {
	try {
		console.log.apply(console, arguments);
	} catch (e) {}
};

atom.extend(Math, {
	hypotenuse: function (cathetus1, cathetus2)  {
		return (cathetus1*cathetus1 + cathetus2*cathetus2).sqrt();
	},
	cathetus: function (hypotenuse, cathetus2)  {
		return (hypotenuse*hypotenuse - cathetus2*cathetus2).sqrt();
	}
});

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str || window.location.href),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
}

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};
