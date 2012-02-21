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

var LibCanvas = this.LibCanvas = declare({
	name: 'LibCanvas',

	own: {
		Buffer: function () {
			return LibCanvas.buffer.apply( LibCanvas, arguments );
		},
		buffer: function (width, height, withCtx) {
			var size, a = slice.call(arguments), last = a[a.length-1];

			withCtx = (typeof last === 'boolean' ? a.pop() : false);

			size = Size(a.length == 1 ? a[0] : a);
			
			var canvas = atom.dom.create("canvas", {
				width  : size.width,
				height : size.height
			}).first;
			
			if (withCtx) canvas.ctx = canvas.getContext('2d-libcanvas');
			return canvas;
		},
		'declare.classes': {},
		declare: function (declareName, shortName, object) {
			if (typeof shortName == 'object') {
				object = shortName;
				shortName = null;
			}
			var Class = declare( declareName, object );
			if (shortName) {
				if (shortName in this['declare.classes']) {
					throw new Error( 'Duplicate declaration: ' + shortName );
				}
				this['declare.classes'][shortName] = Class;
			}
			return Class;
		},
		extract: function (to) {
			to = to || global;
			for (var k in this['declare.classes']) {
				to[k] = this['declare.classes'][k];
			}
			return to;
		}
	}
});