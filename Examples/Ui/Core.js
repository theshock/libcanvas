/*
---

name: "Ui.Core"

description: "Ui.Core"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: Ui.Core

...
*/

new function () {

var LC   = LibCanvas.extract({}),
	rand = Number.random;

LibCanvas.Examples.Ui = atom.Class({
	Implements: [atom.Class.Options],
	options: {
		width : 400,
		height: 250
	},
	initialize: function (options) {
		this.setOptions(options);
		return this.init.context(this);
	},
	init: function (canvas) {
		var libcanvas = this.libcanvas = this.createLibcanvas(canvas);
		this.start(libcanvas);
		libcanvas.start();
	},
	randomPoint: function (padding) {
		if (padding == null) padding = 0;
		return new LC.Point(
			rand(0+padding, this.options.width -padding),
			rand(0+padding, this.options.height-padding)
		);
	},
	randomShape: function (shape) {
		switch(shape) {
			case 'circle'   : return new LC.Circle   (this.randomPoint(), rand(10,30)); break;
			case 'rectangle': return new LC.Rectangle(this.randomPoint(), this.randomPoint()).snapToPixel(); break;
			case 'triangle' : return new LC.Polygon ([this.randomPoint(), this.randomPoint(), this.randomPoint()]); break;
		}
		throw new TypeError('Unknown shape: ' + shape);
	},
	createShaper: function (shape, z, layer) {
		return (layer || this.libcanvas)
			.createShaper({
				shape : shape,
				stroke: '#990000',
				fill  : '#330000',
				hover : {
					stroke: '#ff0000',
					fill  : '#990000'
				},
				active : {
					stroke: '#00ff00',
					fill  : '#009900'
				}
			})
			.setZIndex(z || 0);
	},
	createLibcanvas: function(canvas) {
		var libcanvas = new LibCanvas(canvas, { fps: 50 });
		libcanvas.listenMouse();
		
		return libcanvas
			.size({
				width : this.options.width,
				height: this.options.height
			});
	},
	start: atom.Class.abstractMethod
});

};