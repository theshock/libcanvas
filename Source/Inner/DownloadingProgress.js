/*
---

name: "Inner.DownloadingProgress"

description: "Counting assets downloading progress"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Utils.ImagePreloader
	- Utils.ProgressBar

provides: Inner.DownloadingProgress

...
*/
LibCanvas.namespace('Inner').DownloadingProgress = atom.Class({
	preloadImages : null,
	progressBarStyle : null,
	getImage : function (name) {
		if (this.images && this.images[name]) {
			return this.images[name];
		} else {
			throw new Error('No image «' + name + '»');
		}
	},
	renderProgress : function () {
		if (!this.imagePreloader) {
			this.imagePreloader = new LibCanvas.Utils.ImagePreloader(this.preloadImages)
				.addEvent('ready', function (preloader) {
					this.images = preloader.images;
					atom.log(preloader.getInfo());
					this.readyEvent('ready');
					this.update();
				}.context(this));
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