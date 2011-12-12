/*
---

name: "Scene.App"

description: "LibCanvas.App"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: App

...
*/

LibCanvas.App = Class(
/**
 * @lends LibCanvas.App#
 */
{
	Extends: Class.Options,

	options: {
		name     : 'main',
		autoStart: true,
		clear    : false,
		invoke   : true,
		width    : null,
		height   : null,
		keyboard : false,
		mouse    : false,
		fpsMeter : false,
		fps      : 60
	},

	/**
	 * @returns {LibCanvas.App}
	 */
	initialize: function (canvas, options) {
		this.setOptions( options );
		options = this.options;

		var libcanvas = this.libcanvas = new LibCanvas( canvas, options );

		if (options.width != null && options.height != null) {
			libcanvas.size( options.width, options.height, true );
		}

		if (options.keyboard) libcanvas.listenKeyboard(options.keyboard);
		if (options.mouse   ) {
			libcanvas.listenMouse();
			this.bindMouse(libcanvas.mouse);
		}
		if (options.fpsMeter) libcanvas.fpsMeter();

		this.scenes = [];
		this.scenesIndexed = {};

		libcanvas.start();

		return this;
	},

	createScene: function (name, zIndex, options) {
		if (typeof zIndex == 'object') {
			options = zIndex;
			zIndex  = Infinity;
		}

		var layer = this.libcanvas.createLayer( name );
		var scene = new LibCanvas.Scene.Standard( layer, options );

		this.scenes.push( scene );
		this.scenesIndexed[name] = scene;

		return scene;
	},

	sceneExists: function (name) {
		return name in this.scenesIndexed;
	},

	scene: function (name) {
		if (this.sceneExists(name)) {
			return this.scenesIndexed[name];
		} else {
			throw new Error('No scene with name «' + name + '»');
		}
	},

	sortScenes: function () {
		this.scenes.sort( function (left, right) {
			return left.libcanvas.zIndex < right.libcanvas.zIndex ? -1 : 1;
		});
		return this.scenes;
	},

	ready: function (fn) {
		this.libcanvas.addEvent( 'ready', fn.bind(this) );
		return this;
	},

	bindMouse: function (mouse) {
		var app = this;
		var events = function (method, types) {
			types.forEach(function (type) {
				mouse.addEvent( type, function (e) {
					var scenes = app.sortScenes(), stopped = false;
					for (var i = scenes.length; i--;) {
						stopped = scenes[i].resources.mouse[method]( type, e, stopped );
					}
				});
			});
		};
		events('forceEvent', [ 'dblclick', 'contextmenu', 'wheel' ]);
		events('event'     , [ 'down', 'up', 'move', 'out' ]);
	},

	get rectangle () {
		var size = this.libcanvas.getAppSize();
		return new Rectangle( 0, 0, size.width, size.height );
	}
});