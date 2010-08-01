/*
---
description: Counting assets downloading progress

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Inner.Canvas2D.DownloadingProgress]
*/

LibCanvas.Inner.Canvas2D.DownloadingProgress = new Class({
	preloadImages : null,
	progressBarStyle : null,
	getImage : function (name) {
		if (this.images && this.images[name]) {
			return this.images[name];
		} else {
			throw 'No image "' + name + '"';
		}
	},
	renderProgress : function () {
		if (!this.imagePreloader) {
			this.imagePreloader = new LibCanvas.Utils.ImagePreloader(this.preloadImages)
				.ready(function (preloader) {
					this.images = preloader.images;
					$log(preloader.getInfo());
					this.autoBind('ready');
				}.bind(this));
		}
		if (this.progressBarStyle && !this.progressBar) {
			this.progressBar = new LibCanvas.Utils.ProgressBar()
				.setStyle(this.progressBarStyle);
		}
		if (this.progressBar) {
			this.progressBar
				.setLibcanvas(this)
				.setProgress(this.imagePreloader.getProgress())
				.draw();
		}
	},
	isReady : function () {
		return !this.preloadImages || (this.imagePreloader && this.imagePreloader.isReady());
	}
});