/*
---
description: Provides audio preloader

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.AudioPreloader]
*/

LibCanvas.Utils.AudioPreloader = new Class({
	support : false,
	initialize: function (files) {
		this.checkSupport();
		var audio = {};
		for (var i in files) {
			audio[i] = new LibCanvas.Utils.AudioContainer(this, files[i]);
		}
		this.audio = audio;
	},
	checkSupport : function () {
		var elem = new Element('audio');
		this.support = !elem.canPlayType ? false :
			elem.canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' :
			elem.canPlayType('audio/mpeg;')                ? 'mp3' : false;
		return this;
	},
	muted : false,
	mute : function (unmute) {
		this.muted = !unmute;
		if (!unmute) {
			for (var i in this.audio) {
				this.audio[i].stop();
			}
		}
		return this;
	},
	play : function (name) {
		return this.muted ? null : this.audio[name].playClone();
	}
});