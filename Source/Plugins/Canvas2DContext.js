/*
---

name: "Canvas2DContext"

description: "LibCanvas.Canvas2DContext is similar to original 2d context (and chainable). Can be used for creating your own contexts"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Canvas2DContext

...
*/

new function () {

var object = {
	initialize: function (canvas) {
		if (canvas instanceof CanvasRenderingContext2D) {
			this.ctx2d  = canvas;
			this.canvas = this.ctx2d.canvas;
		} else {
			this.canvas = canvas;
			this.ctx2d  = canvas.getOriginalContext('2d');
		}
	},
	get width () { return this.canvas.width  },
	get height() { return this.canvas.height  },
	set width (width)  { this.canvas.width  = width  },
	set height(height) { this.canvas.height = height }
},

methods = (
	'arc arcTo beginPath bezierCurveTo clearRect clip ' +
	'closePath drawImage fill fillRect fillText lineTo moveTo ' +
	'quadraticCurveTo rect restore rotate save scale setTransform ' +
	'stroke strokeRect strokeText transform translate'
).split(' '),

getterMethods = (
	'createPattern drawFocusRing isPointInPath measureText ' +
	'createImageData createLinearGradient ' +
	'createRadialGradient getImageData putImageData'
).split(' '),

properties = (
	'fillStyle font globalAlpha globalCompositeOperation lineCap ' +
	'lineJoin lineWidth miterLimit shadowOffsetX shadowOffsetY ' +
	'shadowBlur shadowColor strokeStyle textAlign textBaseline'
).split(' ');

properties.forEach(function (property) {
	atom.accessors.define(object, property, {
		set: function (value) {
			try {
				this.ctx2d[property] = value;
			} catch (e) {
				throw TypeError('Exception while setting «' + property + '» to «' + value + '»: ' + e.message);
			}
		},
		get: function () {
			return this.ctx2d[property];
		}
	})
});

methods.forEach(function (method) {
	object[method] = function () {
		this.ctx2d[method].apply(this.ctx, arguments);
		return this;
	};
});

getterMethods.forEach(function (method) {
	object[method] = function () {
		return this.ctx2d[method].apply(this.ctx, arguments);
	};
});

atom.declare( 'LibCanvas.Canvas2DContext', object );

};