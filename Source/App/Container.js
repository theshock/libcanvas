/*
---

name: "App.Container"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.Container

...
*/

/** @private */
App.Container = declare( 'LibCanvas.App.Container', {
	/** @private
	 *  @property {Size} */
	currentSize: null,

	/** @property {App.Layer[]} */
	layers: [],

	initialize: function (settings) {
		this.layers      = [];
		this.settings    = new Settings(settings);
		this.currentSize = new Size(this.settings.get('size') || [0,0]);
		this.createWrappers();
	},

	set size(size) {
		size = this.currentSize.set(size).toObject();

		this.wrapper.css(size);
		this.bounds .css(size);
	},

	get size() {
		return this.currentSize;
	},

	createLayer: function (settings) {
		var layer = new App.Layer( this, settings );
		this.layers.push(layer);
		return layer;
	},

	appendTo: function (element) {
		if (element) this.wrapper.appendTo( element );
		return this;
	},

	/** @private */
	createWrappers: function () {
		this.bounds = atom.dom.create('div').css({
			overflow: 'hidden',
			position: 'absolute'
		})
		.css(this.currentSize.toObject());
		
		this.wrapper = atom.dom.create('div')
			.css(this.currentSize.toObject())
			.addClass('libcanvas-layers-container');

		this.bounds .appendTo(this.wrapper);
		this.wrapper.appendTo(this.settings.get( 'appendTo' ));
	}
});