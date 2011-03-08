/*
---

name: "Utils.AudioElement"

description: "Provides audio container"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Utils.AudioContainer
	- Behaviors.Animatable

provides: Utils.AudioElement

...
*/

LibCanvas.namespace('Utils').AudioElement = atom.Class({
	Implements: [LibCanvas.Behaviors.Animatable],
	stub   : true,
	initialize : function (container, file) {
		if (container.support) {
			this.stub = false;
			this.container = container;
			this.support = container.support;
			this.audio = document.createElement("audio");
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
		if (window.opera) { // opera 10.60 bug. Fixed in 10.61
			var audioClone = document.createElement('audio');
			audioClone.src = this.audio.src;
		} else {
			audioClone = this.audio.cloneNode(true);
		}
		this.events.forEach(function (e) {
			audioClone.addEventListener(e[0], e[1].bind(this), false);
		}.context(this));
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
		if (elem.networkState > 2) {
			// firefox 3.5 starting audio bug
			elem.currentTime = 0.025;
		}
		elem.pause();
		return this;
	},
	restart: function (elem) {
		elem = elem || this.getCurrent();
		elem.currentTime = 0.025;
		if (elem.ended || elem.paused) {
			elem.play();
		}
		return this;
	},
	events : [],
	event : function (event, fn) {
		if (this.stub) return this;
		this.events.push([event, fn]);
		this.audio.addEventListener(event, fn.bind(this), false);
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
				this.event('ended', this.playNext.context(this) ).gatling(2);
				atom(window).bind('unload', this.pause.context(this));
				this.loopBinded = true;
			}
			this.stop().playNext();
		}
		return this;
	},

	// testing. bug if run twice
	fadeOut : function (elem, time) {
		if (this.stub) return this;
		this.animate.call(elem || this.getCurrent(), {
			props  : { volume : 0.05 },
			frames : 20,
			delay  : (time || 1000) / 20,
			onFinish   : function () {
				this.stop();
				this.audio.volume = 0.99;
			}.context(this)
		});
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Utils.AudioElement]')
});