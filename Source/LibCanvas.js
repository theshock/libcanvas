/*
---

name: "LibCanvas"

description: "LibCanvas initialization"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: LibCanvas

...
*/

var LibCanvas = this.LibCanvas = Class(
/** @lends LibCanvas.prototype */
{
	Static: {
		Buffer: function (width, height, withCtx) {
			var a = Array.pickFrom(arguments), zero = (width == null || width === true);
			if (zero || width.width == null || width.height == null) {
				width   = zero ? 0 : a[0];
				height  = zero ? 0 : a[1];
				withCtx = zero ? a[0] : a[2];
			} else {
				withCtx = !!height;
				height  = width.height;
				width   = width.width
			}
			
			var canvas = atom.dom
				.create("canvas", {
					width  : width,
					height : height
				}).get();
			
			if (withCtx) canvas.ctx = canvas.getContext('2d-libcanvas');
			return canvas;
		},
		isLibCanvas: function (elem) {
			return elem && elem instanceof Canvas2D;
		},
		namespace: function (namespace) {
			var current;
			Array.from(arguments).forEach(function (namespace) {
				current = LibCanvas;
				namespace.split('.').forEach(function(part){
					if (current[part] == null) current[part] = {};
					current = current[part];
				});
			});
			return current;
		},
		extract: function (to) {
			to = to || atom.global;

			for (var i in {Shapes: 1, Behaviors: 1, Utils: 1}) {
				for (var k in LibCanvas[i]) {
					to[k] = LibCanvas[i][k];
				}
			}
			for (i in {Point: 1, Animation: 1, Processors: 1, Context2D: 1}) {
				to[i] = LibCanvas[i];
			}
			return to;
		},

		get invoker () {
			if (this._invoker == null) {
				this._invoker = new Invoker().invoke();
			}
			return this._invoker;
		}
	},
	/**
	 * @constructs
	 * @returns {LibCanvas.Canvas2D}
	 */
	initialize: function() {
		return Canvas2D.factory(arguments);
	}
});

LibCanvas.Animation  = {};
LibCanvas.Behaviors  = {};
LibCanvas.Engines    = {};
LibCanvas.Inner      = {};
LibCanvas.Processors = {};
LibCanvas.Scene      = {};
LibCanvas.Shapes     = {};
LibCanvas.Ui         = {};
LibCanvas.Utils      = {};

var
	Inner      = LibCanvas.Inner,
	Processors = LibCanvas.Processors,
	Buffer     = LibCanvas.Buffer,
	Scene      = LibCanvas.Scene;