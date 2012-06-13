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

/**
 * @class App.Container
 * @private */
declare( 'LibCanvas.App.Container', {
	/** @private
	 *  @property {Size} */
	currentSize: null,

	/** @property {App.Dom[]} */
	doms: [],

	initialize: function (settings) {
		this.doms        = [];
		this.settings    = new Settings(settings);
		this.currentSize = new Size(this.settings.get('size') || [0,0]);
		this.createWrappers();
	},

	get rectangle () {
		var size = this.size;
		return new Rectangle(0, 0, size.width, size.height);
	},

	set size(size) {
		size = this.currentSize.set(size).toObject();

		this.wrapper.css(size);
		this.bounds .css(size);
	},

	get size() {
		return this.currentSize;
	},

	createDom: function (settings) {
		var dom = new App.Dom( this, settings );
		this.doms.push(dom);
		return dom;
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