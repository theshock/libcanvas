
LibCanvas.Utils.ImagePreloader = new Class({
	initialize: function (images) {
		this.count = {
			errors : 0,
			aborts : 0,
			loaded : 0
		};

		this.images = {};
		this.processed = 0;
		this.number    = this
			.createImages(images)
			.getLength();
	},
	onProcessed : function (type) {
		this.count[type]++;
		this.ready = (++this.processed == this.number);
		return this;
	},
	getInfo : function () {
		var stat = "Images preloaded: {loaded}; Errors: {errors}; Aborts: {aborts}"
			.template(this.count);
		var ready = this.ready ? "Image preloading has completed;\n" : '';
		return ready + stat;
	},
	getProgress : function () {
		return this.isReady() ? 1 : (this.processed / this.number).round(3);
	},
	isReady : function () {
		return (this.number == this.processed);
	},
	createImages : function (images) {
		var $this = this;
		var h = new Hash(images)
		h.each(function (img, key) {
				$this.images[key] = new Element('img', {
					src : img
				})
				.addEvents({
					load  : function() {
						$this.onProcessed('loaded');
					},
					error : function() {
						$this.onProcessed('errors');
					},
					abort : function() {
						$this.onProcessed('aborts');
					}
				});
			});
		return h;
	}
});