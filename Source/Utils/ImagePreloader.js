/*
---

name: "Utils.ImagePreloader"

description: "Provides images preloader"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Shapes.Rectangle

provides: Utils.ImagePreloader

...
*/

var ImagePreloader = LibCanvas.Utils.ImagePreloader = Class({
	Implements: Class.Events,
	processed : 0,
	number: 0,
	initialize: function (images, suffix) {
		this.count = {
			errors : 0,
			aborts : 0,
			loaded : 0
		};

		if (Array.isArray(images)) images = Object.map(images[1], function (src) {
			if(src.begins('http://') || src.begins('https://') ) {
				return src;
			}
			return images[0] + src;
		});
		this.suffix    = suffix;
		this.usrImages = images;
		this.domImages = this.createDomImages(images);
		this.images    = {};
	},
	cutImages: function () {
		var i, parts, img;
		for (i in this.usrImages) {
			parts = this.splitUrl( this.usrImages[i] );
			img   = this.domImages[ parts.url ];
			if (parts.coords) img = img.sprite(Rectangle( parts.coords ));
			this.images[i] = img;
		}
		return this;
	},
	onProcessed : function (type, img) {
		if (type == 'loaded' && window.opera) {
			// opera fullscreen bug workaround
			img.width  = img.width;
			img.height = img.height;
			img.naturalWidth  = img.naturalWidth;
			img.naturalHeight = img.naturalHeight;
		}
		this.count[type]++;
		this.processed++;
		if (this.isReady()) this.cutImages().readyEvent('ready', [this]);
		return this;
	},
	get info () {
		var stat = "Images loaded: {loaded}; Errors: {errors}; Aborts: {aborts}"
			.substitute(this.count);
		var ready = this.isReady() ? "Image preloading has completed;\n" : '';
		return ready + stat;
	},
	getInfo : function () {
		return this.info
	},
	get progress () {
		return this.isReady() ? 1 : (this.processed / this.number).round(3);
	},
	getProgress : function () {
		return this.progress;
	},
	isReady : function () {
		return (this.number == this.processed);
	},
	createDomImage : function (src) {
		this.number++;
		var img = new Image();
		img.src = src;
		if (window.opera && img.complete) {
			this.onProcessed.delay(10, this, ['loaded', img]);
		} else {
			img.addEventListener( 'load' , this.onProcessed.bind(this, 'loaded', img), false );
			img.addEventListener( 'error', this.onProcessed.bind(this, 'errors', img), false );
			img.addEventListener( 'abort', this.onProcessed.bind(this, 'aborts', img), false );
		}
		return img;
	},
	splitUrl: function (str) {
		var url = str, size, cell, match, coords = null;

				// searching for pattern 'url [x:y:w:y]'
		if (match = str.match(/ \[(\d+)\:(\d+)\:(\d+)\:(\d+)\]$/)) {
			coords = match.slice( 1 );
				// searching for pattern 'url [w:y]{x:y}'
		} else if (match = str.match(/ \[(\d+)\:(\d+)\]\{(\d+)\:(\d+)\}$/)) {
			coords = match.slice( 1 ).map( Number );
			size = coords.slice( 0, 2 );
			cell = coords.slice( 2, 4 );
			coords = [ cell[0] * size[0], cell[1] * size[1], size[0], size[1] ];
		}
		if (match) {
			url = str.substr(0, str.lastIndexOf(match[0]));
			coords = coords.map( Number );
		}
		if (this.suffix) {
			if (typeof this.suffix == 'function') {
				url = this.suffix( url );
			} else {
				url += this.suffix;
			}
		}
		
		return { url: url, coords: coords };
	},
	createDomImages: function (images) {
		var i, result = {}, url;
		for (i in images) {
			url = this.splitUrl( images[i] ).url;
			if (!result[url]) result[url] = this.createDomImage( url );
		}
		return result;
	},
	ready : function (fn) {
		this.addEvent('ready', fn);
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Utils.ImagePreloader]')
});