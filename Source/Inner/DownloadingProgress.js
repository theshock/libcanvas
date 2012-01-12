/*
---

name: "Inner.DownloadingProgress"

description: "Counting assets downloading progress"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Inner.DownloadingProgress

...
*/
var DownloadingProgress = declare( 'LibCanvas.Inner.DownloadingProgress', {
	imageExists: function (name) {
		if (this.parentLayer) return this.parentLayer.imageExists(name);

		return !!(this.images && this.images[name]);
	},
	getImage : function (name) {
		if (this.parentLayer) return this.parentLayer.getImage(name);
		
		if (this.images && this.images[name]) {
			return this.images[name];
		} else {
			throw new Error('No image «' + name + '»');
		}
	},
	getAudio: function (name) {
		if (this.parentLayer) return this.parentLayer.getAudio(name);
		
		if (this._audio) {
			var audio = this._audio.get(name);
			if (audio) return audio;
		}
		throw new Error('No audio «' + name + '»');
	},
	renderProgress : function () {
		if (this.parentLayer) return;
		
		if (this.settings.get('progressBarStyle') && !this.progressBar) {
			if (typeof ProgressBar == 'undefined') {
				throw new Error('LibCanvas.Utils.ProgressBar is not loaded');
			}
			this.progressBar = new ProgressBar()
				.setStyle(this.settings.get('progressBarStyle'));
		}
		if (this.progressBar) {
			this.progressBar
				.setLibcanvas(this)
				.setProgress(this.imagePreloader.getProgress())
				.draw();
		}
	},
	createPreloader : function () {
		if (!this.imagePreloader) {

			var settings = this.settings;
			var events   = this.events;
			
			if (this.parentLayer) {
				this.parentLayer.addEvent('ready', function () {
					events.ready('ready');
				});
				this.imagePreloader = true;
				return;
			}
			
			if (settings.get('preloadAudio')) {
				if (typeof AudioContainer == 'undefined') {
					throw new Error('LibCanvas.Utils.AudioContainer is not loaded');
				}
				this._audio = new AudioContainer(settings.get('preloadAudio'));
			} else {
				this._audio = null;
			}

			if (settings.get('preloadImages')) {
				if (typeof ImagePreloader == 'undefined') {
					throw new Error('LibCanvas.Utils.ImagePreloader is not loaded');
				}
				this.imagePreloader = new ImagePreloader(settings.get('preloadImages'), settings.get('imagesSuffix'))
					.addEvent('ready', function (preloader) {
						this.images = preloader.images;
						console.log(preloader.getInfo());
						events.ready('ready');
						this.update();
					}.bind(this));
			} else {
				this.images = {};
				this.imagePreloader = true;
				events.ready('ready');
			}
		}

	},
	isReady : function () {
		this.createPreloader();
		if (this.parentLayer) return this.parentLayer.isReady();

		var pI = settings.get('preloadImages');
		return !pI || !Object.keys(pI).length
			|| (this.imagePreloader && this.imagePreloader.isReady());
	}
});