/*
---
name: "LibCanvas"

description: "LibCanvas initialization"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>
- Anna Shurubey aka Nutochka <iamnutochka@gmail.com>
- Nikita Baksalyar <nikita@baksalyar.ru>

provides: LibCanvas

...
*/


(function () {

var LibCanvas = window.LibCanvas = atom.Class({
	Static: {
		Buffer: function (width, height, withCtx) {
			var a = Array.pickFrom(arguments), zero = (width == null || width === true);
			width   = zero ? 0 : a[0];
			height  = zero ? 0 : a[1];
			withCtx = zero ? a[0] : a[2];
			
			var canvas = atom()
				.create("canvas", {
					width  : width,
					height : height
				}).get();
			
			if (withCtx) canvas.ctx = canvas.getContext('2d-libcanvas');
			return canvas;
		},
		isLibCanvas: function (elem) {
			return elem && elem instanceof LibCanvas.Canvas2D;
		},
		namespace: function (namespace) {
			var current = LibCanvas;
			namespace.split('.').forEach(function(part){
				if (current[part] == null) current[part] = {};
				current = current[part];
			});
			return current;
		},
		extract: function (to, what) {
			to = to || window;
			for (var i in {Shapes: 1, Behaviors: 1, Utils: 1}) {
				if (!what || what.contains(i)) atom.extend(to, LibCanvas[i]);
			}
			for (i in {Point: 1, Animation: 1, Buffer: 1}) {
				if (!what || what.contains(i)) to[i] = LibCanvas[i];
			}
			return to;
		},
		newContexts: {},
		addCanvasContext: function (name, ctx) {
			this.newContexts[name] = ctx;
			return this;
		},
		getCanvasContext: function (name) {
			return this.newContexts[name] || null;
		}
	},
	initialize: function() {
		return LibCanvas.Canvas2D.factory(arguments);
	}
});
	
// Changing HTMLCanvasElement.prototype.getContext, so we
// can create our own contexts by LibCanvas.addCanvasContext(name, ctx);
atom.implement(HTMLCanvasElement, {
	getOriginalContext: HTMLCanvasElement.prototype.getContext,
	getContext: function (type) {
		if (!this.contextsList) {
			this.contextsList = {};
		}

		if (!this.contextsList[type]) {
			var ctx;
			if (ctx = LibCanvas.getCanvasContext(type)) {
				ctx = new ctx(this);
			} else try {
				ctx = this.getOriginalContext.apply(this, arguments);
			} catch (e) {
				throw (!e.toString().test(/NS_ERROR_ILLEGAL_VALUE/)) ? e :
					new TypeError('Wrong Context Type: «' + type + '»');
			}
			this.contextsList[type] = ctx;
		}
		return this.contextsList[type];
	}
});

})();