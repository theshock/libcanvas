/*
---
description: Provides images preloader

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.ImagePreloader]
*/

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

		this.readyfuncs = [];
	},
	onProcessed : function (type) {
		this.count[type]++;
		this.processed++;
		if (this.isReady()) {
			this.readyfuncs.each(function (fn) {
				fn(this);
			}.bind(this));
		}
		return this;
	},
	getInfo : function () {
		var stat = "Images loaded: {loaded}; Errors: {errors}; Aborts: {aborts}"
			.substitute(this.count);
		var ready = this.isReady() ? "Image preloading has completed;\n" : '';
		return ready + stat;
	},
	getProgress : function () {
		return this.isReady() ? 1 : (this.processed / this.number).round(3);
	},
	isReady : function () {
		return (this.number == this.processed);
	},
	createEvent : function (type) {
		return (function () {
			this.onProcessed(type);
		}).bind(this);
	},
	createImage : function (img, key) {
		this.images[key] = new Element('img', {
				src : img
			})
			.addEvents({
				load  : this.createEvent('loaded'),
				error : this.createEvent('errors'),
				abort : this.createEvent('aborts')
			});
	},
	createImages : function (images) {
		images = new Hash(images);
		images.each(
			this.createImage.bind(this)
		);
		return images;
	},
	ready : function (fn) {
		if (this.isReady()) {
			fn(this);
		} else {
			this.readyfuncs.push(fn);
		}
		return this;
	}
});