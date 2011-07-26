/*
---

name: "Utils.AudioContainer"

description: "Provides audio preloader"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Utils.AudioContainer

...
*/

var AudioContainer = LibCanvas.Utils.AudioContainer = Class({
	support : false,
	initialize: function (files) {
		this.allAudios = [];
		this.checkSupport();
		var audio = {};
		for (var i in files) {
			audio[i] = new AudioElement(this, files[i]);
		}
		this.audio = audio;
	},
	checkSupport : function () {
		var elem = document.createElement('audio');
		if (elem.canPlayType) {
			var cpt = elem.canPlayType.bind(elem);
			this.support = {
				// codecs
				ogg : cpt('audio/ogg; codecs="vorbis"'),
				mp3 : cpt('audio/mpeg;'),
				wav : cpt('audio/wav; codecs="1"'),
				m4a : cpt('audio/x-m4a;') || cpt('audio/aac;'),
				// diff
				loop : 'loop' in elem
			};
		}
		return this;
	},
	get : function (index) {
		return this.audio[index];
	},
	mute : function (muted) {
		this.allAudios.forEach(function (audio) {
			audio.muted = muted;
		})
	},
	toString: Function.lambda('[object LibCanvas.Utils.AudioContainer]')
});