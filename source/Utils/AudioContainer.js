/*
---
description: Provides audio container

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.AudioContainer]
*/

LibCanvas.Utils.AudioContainer = new Class({
	preloader : null,
	element   : null,
	stub      : false,
	initialize : function (preloader, file) {
		this.preloader = preloader;
		if (this.preloader.support) {
			this.element = new Element('audio');
			this.element.src = this.createSrc(file);
			this.element.load();
		} else {
			this.stub = true;
		}
		this.getClone();
	},
	createSrc : function (file) {
		return file.replace(/\*/g, this.preloader.support);
	},
	run : function (method, args) {
		$log(method);
		!this.stub && this.element.readyState >= 3 &&
			this.element[method].apply( this.element, args || [] );
		return this;
	},
	set : function (name, value) {
		this.element[name] = value;
		return this;
	},
	clone : null,
	getClone : function () {
		var clone = this.clone;
		this.clone = this.element.clone();
		return clone || this.element.clone();
	},
	playClone : function () {
		var clone = this.getClone();
		clone.play();
		return clone;
	}
});