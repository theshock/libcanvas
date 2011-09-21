/*
---

name: "Utils.AudioElement"

description: "Provides audio container"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Utils.AudioContainer
	- Behaviors.Animatable

provides: Utils.AudioElement

...
*/

var AudioElement = LibCanvas.Utils.AudioElement = Class({
	Implements: Animatable,
	stub   : true,
	initialize : function (container, file) {
		this.events = [];
		if (container.support) {
			this.stub = false;
			this.container = container;
			this.support = container.support;
			this.audio = document.createElement("audio");
			this.audio.preload = true;
			this.src(file);
			container.allAudios.push(this.audio);
		}
	},
	src : function (file) {
		if (this.stub) return this;
		var gatling = file.match(/:(\d+)$/);
		if (gatling) {
			file = file.replace(/:\d+$/, '');
			gatling = gatling[1];
		}
		this.audio.src = file.replace(/\*/g, this.getExtension());
		this.audio.load();
		if (gatling) this.gatling(gatling);
		return this;
	},
	getExtension : function () {
		if (this.stub) return null;
		return this.support.ogg ? 'ogg' :
		       this.support.mp3 ? 'mp3' : 'wav';
	},
	cloneAudio : function () {
		if (this.stub) return null;
		// opera 10.6 bug & IE 9 bug
		// audioClone = this.audio.cloneNode(true);
		var audioClone = document.createElement('audio');
		audioClone.src = this.audio.src;
		this.events.forEach(function (e) {
			audioClone.addEventListener(e[0], e[1].bind(this), false);
		}.bind(this));
		this.container.allAudios.push(audioClone);
		audioClone.load();
		return audioClone;
	},
	play : function (elem) {
		if (this.stub) return this;
		(elem || this.getCurrent()).play();
		return this;
	},
	pause : function (elem) {
		if (this.stub) return this;
		(elem || this.getCurrent()).pause();
		return this;
	},
	stop : function (elem) {
		if (this.stub) return this;
		elem = elem || this.getCurrent();
		try {
			elem.currentTime = 0.025;
			elem.pause();
		} catch (ignored) { }
		return this;
	},
	restart: function (elem) {
		elem = elem || this.getCurrent();
		this.stop( elem );
		if (elem.ended || elem.paused) {
			elem.play();
		}
		return this;
	},
	event : function (event, fn) {
		if (this.stub) return this;
		this.events.push([event, fn]);
		this.audio.addEventListener(event, fn.bind(this), false);
		return this;
	},
	set: function (params) {
		var elem = this.getCurrent();

		if (elem && params) for (var i in params) if (params.hasOwnProperty(i)) {
			elem[i] = params[i];
		}

		return this;
	},

	// Gatling
	gatling : function (count) {
		if (this.stub) return this;
		this.barrels = [];
		this.gatIndex =  0;
		while (count--) this.barrels.push(this.cloneAudio());
		return this;
	},
	getNext : function () {
		if (this.stub) return null;
		++this.gatIndex >= this.barrels.length && (this.gatIndex = 0);
		return this.getCurrent();
	},
	getCurrent : function () {
		if (this.stub) return null;
		return this.barrels ? this.barrels[this.gatIndex] : this.audio;
	},
	playNext : function () {
		if (this.stub) return this;
		this.getNext();
		this.restart();
		return this;
	},

	// Loop (using gatling in browsers, that doesn't support loop, e.g. in fx)
	loopBinded : false,
	loop : function () {
		if (this.stub) return this;
		if (this.support.loop) {
			this.audio.loop = 'loop';
			this.stop().play();
		} else {
			if (!this.loopBinded) {
				this.event('ended', this.playNext.bind(this) ).gatling(2);
				atom.dom(window).bind('unload', this.pause.bind(this));
				this.loopBinded = true;
			}
			this.stop().playNext();
		}
		return this;
	},

	fade: function (time, volume, out) {
		if (this.stub) return this;

		var elem = this.getCurrent();

		if (!out) this.play();

		new Animatable(elem).animate({
			props: { volume : volume },
			fn: out ? 'expo-out' : 'sine-out',
			time : time || 500,
			onFinish   : function () {
				if (out) this.stop();
			}.bind(this)
		});
		return this;
	},

	fadeOut : function (time, volume) {
		return this.fade( time, volume || 0.0, true);
	},

	fadeIn : function (time, volume) {
		return this.fade( time, volume || 1.0, false);
	},

	fadeToggle: function (time, volumeUp, volumeDown) {
		if (volumeUp.equals( this.getCurrent().volume, 3 )) {
			this.fadeOut( time, volumeDown );
		} else {
			this.fadeIn( time, volumeUp );
		}
		return this;
	},

	toString: Function.lambda('[object LibCanvas.Utils.AudioElement]')
});