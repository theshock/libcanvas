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
	Implements: [Class.Events],
	processed : 0,
	number: 0,
	initialize: function (images) {
		this.count = {
			errors : 0,
			aborts : 0,
			loaded : 0
		};

		if (Array.isArray(images)) images = Object.map(images[1], function (src) {
			return images[0] + src;
		});
		this.images = this.createImages(images);
	},
	onProcessed : function (type) {
		this.count[type]++;
		this.processed++;
		if (this.isReady()) this.readyEvent('ready', [this]);
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
		return this.onProcessed.context(this, [type]);
	},
	createImage : function (src, key) {
		this.number++;
		return atom.dom
			.create('img', { src : src })
			.bind({
				load  : this.createEvent('loaded'),
				error : this.createEvent('errors'),
				abort : this.createEvent('aborts')
			})
			.get();
	},
	createImages : function (images) {
		var imgs = {};
		for (var i in images) imgs[i] = this.createImage(images[i], i);
		return imgs;
	},
	ready : function (fn) {
		this.addEvent('ready', fn);
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Utils.ImagePreloader]')
});