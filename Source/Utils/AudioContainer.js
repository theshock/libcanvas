/*
---
description: Provides audio preloader

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.AudioContainer]
*/

LibCanvas.namespace('Utils').AudioContainer = atom.Class({
	support : false,
	initialize: function (files) {
		this.checkSupport();
		var audio = {};
		for (var i in files) {
			audio[i] = new LibCanvas.Utils.AudioElement(this, files[i]);
		}
		this.audio = audio;
	},
	checkSupport : function () {
		var elem = document.createElement('audio');
		if (elem.canPlayType) {
			var cpt = elem.canPlayType.context(elem);
			this.support = atom.extend(new Boolean(true), {
				// codecs
				ogg : cpt('audio/ogg; codecs="vorbis"'),
				mp3 : cpt('audio/mpeg;'),
				wav : cpt('audio/wav; codecs="1"'),
				m4a : cpt('audio/x-m4a;') || cpt('audio/aac;'),
				// diff
				loop : 'loop' in elem
			});
		}
		return this;
	},
	get : function (index) {
		return this.audio[index];
	},
	allAudios : [],
	mute : function (muted) {
		this.allAudios.forEach(function (audio) {
			audio.muted = muted;
		})
	}
});