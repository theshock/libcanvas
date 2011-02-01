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

LibCanvas.Examples.Ui = atom.Class({
	Implements: [atom.Class.Options],
	options: {
		width : 400,
		height: 250
	},
	initialize: function (canvas, options) {
		this.setOptions(options);
		return this.init.context(this);
	},
	init: function (canvas) {
		var libcanvas = this.libcanvas = this.createLibcanvas(canvas);
		this.start(libcanvas);
		libcanvas.start();
	},
	createLibcanvas: function(canvas) {
		var libcanvas = new LibCanvas(canvas);
		libcanvas.listenMouse();
		libcanvas.fps = 50;
		libcanvas.autoUpdate = 'onRequest';

		libcanvas.addProcessor('pre', new LibCanvas.Processors.Clearer());
		return libcanvas
			.set({
				width : this.options.width,
				height: this.options.height
			});
	},
	start: atom.Class.abstractMethod
});