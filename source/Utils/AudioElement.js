/*
---
description: Provides audio container

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.AudioElement]
*/

LibCanvas.Utils.AudioElement = new Class({
	Implements : [LibCanvas.Interfaces.Animatable],
	stub   : true,
	initialize : function (container, file) {
		if (container.support) {
			this.support = container.support;
			this.audio = document.createElement("audio");
			this.src(file);
			this.stub = false;
		}
	},
	src : function (file) {
		this.audio.src = file.replace(/\*/g, this.getExtension());
		this.audio.load();
		return this;
	},
	getExtension : function () {
		return this.support.ogg ? 'ogg' :
		       this.support.mp3 ? 'mp3' : 'wav';
	},
	cloneAudio : function () {
		if (window.opera) { // opera 10.60 bug. Fixed in 10.61
			var audioClone = document.createElement('audio');
			audioClone.src = this.audio.src;
		} else {
			audioClone = this.audio.cloneNode(true);
		}
		this.events.each(function (e) {
			audioClone.addEventListener(e[0], e[1].bind(this), false);
		}.bind(this));
		audioClone.load();
		return audioClone;
	},
	play : function () {
		this.getCurrent().play();
		return this;
	},
	pause : function () {
		this.getCurrent().pause();
		return this;
	},
	stop : function (elem) {
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
		this.events.push([event, fn]);
		this.audio.addEventListener(event, fn.bind(this), false);
		return this;
	},

	// Gatling
	gatling : function (count) {
		this.barrels = [];
		this.gatIndex =  0;
		while (count--) {
			this.barrels.push(this.cloneAudio());
		}
		return this;
	},
	getNext : function () {
		++this.gatIndex >= this.barrels.length && (this.gatIndex = 0);
		return this.getCurrent();
	},
	getCurrent : function () {
		return this.barrels ? this.barrels[this.gatIndex] : this.audio;
	},
	playNext : function () {
		var elem = this.getNext();
		this.stop(elem);
		elem.play();
		return this;
	},

	// Loop (using gatling in browsers, that doesn't support loop, e.g. in fx)
	loopBinded : false,
	loop : function () {
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