/*
---
description: Provides audio container

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.AudioElement]
*/

LibCanvas.Utils.AudioElement = new Class({
	Implements : [LibCanvas.Behaviors.Animatable],
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
		this.audio.src = file.replace(/\*/g, this.getExtension());
		this.audio.load();
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
		this.events.each(function (e) {
			audioClone.addEventListener(e[0], e[1].bind(this), false);
		}.bind(this));
		this.container.allAudios.push(audioClone);
		audioClone.load();
		return audioClone;
	},
	play : function () {
		if (this.stub) return this;
		this.getCurrent().play();
		return this;
	},
	pause : function () {
		if (this.stub) return this;
		this.getCurrent().pause();
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
		while (count--) {
			this.barrels.push(this.cloneAudio());
		}
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
		var elem = this.getNext();
		this.stop(elem);
		elem.play();
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
				this.event('ended', function () {
					this.playNext();
				}).gatling(2);
				window.addEvent('unload', function () {
					this.pause.bind(this)
				});
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
			}.bind(this)
		});
		return this;
	}
});