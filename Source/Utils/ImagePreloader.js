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

/**
 * @class
 * @name ImagePreloader
 * @name LibCanvas.Utils.ImagePreloader
 */
var ImagePreloader = LibCanvas.declare( 'LibCanvas.Utils.ImagePreloader', 'ImagePreloader', {
	processed : 0,
	number    : 0,
	
	initialize: function (settings) {
		this.events   = new Events(this);
		this.settings = new Settings(settings).addEvents(this.events);

		this.count = {
			error: 0,
			abort: 0,
			load : 0
		};
		
		this.suffix    = this.settings.get('suffix') || '';
		this.usrImages = this.prefixImages(this.settings.get('images'));
		this.domImages = this.createDomImages();
		this.images    = {};
	},
	get isReady () {
		return this.number == this.processed;
	},
	get info () {
		var stat = atom.string.substitute(
			"Images loaded: {load}; Errors: {error}; Aborts: {abort}",
			this.count
		);
		if (this.isReady) stat = "Image preloading has completed;\n" + stat;
		return stat;
	},
	get progress () {
		return this.isReady ? 1 : atom.number.round(this.processed / this.number, 4);
	},
	exists: function (name) {
		return !!this.images[name];
	},
	get: function (name) {
		var image = this.images[name];
		if (image) {
			return image;
		} else {
			throw new Error('No image «' + name + '»');
		}
	},

	/** @private */
	prefixImages: function (images) {
		var prefix = this.settings.get('prefix');
		if (!prefix) return images;

		return Object.map(images, function (src) {
			if(src.begins('http://') || src.begins('https://') ) {
				return src;
			}
			return prefix + src;
		});
	},
	/** @private */
	cutImages: function () {
		var i, parts, img;
		for (i in this.usrImages) {
			parts = this.splitUrl( this.usrImages[i] );
			img   = this.domImages[ parts.url ];
			if (parts.coords) img = img.sprite(new Rectangle( parts.coords ));
			this.images[i] = img;
		}
		return this;
	},
	/** @private */
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
	/** @private */
	createDomImages: function () {
		var i, result = {}, url, images = this.usrImages;
		for (i in images) {
			url = this.splitUrl( images[i] ).url;
			if (!result[url]) result[url] = this.createDomImage( url );
		}
		return result;
	},
	/** @private */
	createDomImage : function (src) {
		var img = new Image();
		img.src = src;
		if (window.opera && img.complete) {
			setTimeout(this.onProcessed.bind(this, 'load', img), 10);
		} else {
			['load', 'error', 'abort'].forEach(function (event) {
				img.addEventListener( event, this.onProcessed.bind(this, event, img), false );
			}.bind(this));
		}
		this.number++;
		return img;
	},
	/** @private */
	onProcessed : function (type, img) {
		if (type == 'load' && window.opera) {
			// opera fullscreen bug workaround
			img.width  = img.width;
			img.height = img.height;
			img.naturalWidth  = img.naturalWidth;
			img.naturalHeight = img.naturalHeight;
		}
		this.count[type]++;
		this.processed++;
		if (this.isReady) this.cutImages().events.ready('ready', [this]);
		return this;
	}
});