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
	 * @constructs
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

	/**
	 * @param {string} [name=null]
	 * @param {number} [zIndex=Infinity]
	 * @param {object} [options={}]
	 * @returns {LibCanvas.Scene.Standard}
	 */
	createScene: function (name, zIndex, options) {
		if (name != null && typeof name != 'string') {
			options = zIndex;
			zIndex  = name;
			name    = null;
		}
		if (typeof zIndex == 'object') {
			options = zIndex;
			zIndex  = Infinity;
		}

		var layer = this.libcanvas;
		if (name) {
			if (layer.layerExists(name)) {
				layer = layer.layer(name);
			} else {
				layer = layer.createLayer(name);
			}
		}

		var scene = new LibCanvas.Scene.Standard( layer, options );

		this.scenes.push( scene );
		this.scenesIndexed[name] = scene;

		return scene;
	},

	/**
	 * @param {string} name
	 * @returns {boolean}
	 */
	sceneExists: function (name) {
		return name in this.scenesIndexed;
	},

	/**
	 * @param {string} name
	 * @throws {Error}
	 * @returns {LibCanvas.Scene.Standard}
	 */
	scene: function (name) {
		if (this.sceneExists(name)) {
			return this.scenesIndexed[name];
		} else {
			throw new Error('No scene with name «' + name + '»');
		}
	},

	/** @private */
	sortScenes: function () {
		this.scenes.sort( function (left, right) {
			return left.libcanvas.zIndex < right.libcanvas.zIndex ? -1 : 1;
		});
		return this.scenes;
	},

	/**
	 * @param {function} callback
	 * @returns {LibCanvas.App}
	 */
	ready: function (callback) {
		this.libcanvas.addEvent( 'ready', callback.bind(this) );
		return this;
	},

	/** @private */
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

	/** @property {LibCanvas.Shapes.Rectangle} rectangle */
	get rectangle () {
		var size = this.libcanvas.getAppSize();
		return new Rectangle( 0, 0, size.width, size.height );
	}
});