/*
---

name: "Scene.Dragger"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Scene.Standard

provides: Scene.Dragger

...
*/

Scene.Dragger = Class({

	Extends: Class.Events,


	initialize: function (mouse) {
		Class.bindAll( this, [ 'dragStart', 'dragStop', 'dragMove' ]);

		this.mouse  = mouse;
		this.scenes = [];

		this.events = {
			down: this.dragStart,
			up  : this.dragStop,
			out : this.dragStop,
			move: this.dragMove
		};
	},

	addScene: function (scene) {
		this.scenes.push( scene );
		return this;
	},

	started: false,

	start: function (callback) {
		if (callback !== undefined) {
			this.callback = callback;
		}
		this.started = true;
		this.mouse.addEvent( this.events );
		return this;
	},

	stop: function () {
		this.started = false;
		this.mouse.removeEvent( this.events );
		return this;
	},

	addShift: function (delta) {
		this.addLayersShift(delta);
		this.closeLayersShift(false);
		return this;
	},

	/** @private */
	dragStart: function (e) {
		if (!this.shouldStartDrag(e)) return;

		for (var i = this.scenes.length; i--;) {
			var scene = this.scenes[i];
			scene.mouse.stop();
			scene.stop();
		}
		this.drag = true;
		this.fireEvent( 'start', [ e ]);
	},
	/** @private */
	dragStop: function (e) {
		if (!this.drag) return;
		this.closeLayersShift(true);
		this.drag = false;
		this.fireEvent( 'stop', [ e ]);
	},
	/** @private */
	dragMove: function (e) {
		if (this.drag) {
			this.addLayersShift(e.deltaOffset);
		}
	},
	closeLayersShift: function (start) {
		for (var i = this.scenes.length; i--;) {
			var scene = this.scenes[i];
			scene.addElementsShift();
			if (start) {
				scene.mouse.start();
				scene.start();
			}
		}
	},
	/** @private */
	addLayersShift: function (point) {
		for (var i = this.scenes.length; i--;) {
			this.scenes[i].addShift(point);
		}
	},
	/** @private */
	shouldStartDrag: function (e) {
		if (!this.started) return false;

		return this.callback ? this.callback(e) : true;
	}

});