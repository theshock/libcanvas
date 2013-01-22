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

	wrapper: null,
	bounds : null,

	initialize: function (settings) {
		this.doms        = [];
		this.settings    = new Settings(settings);
		this.currentSize = new Size(this.settings.get('size') || [0,0]);

		this.isSimple = this.settings.get('simple');

		if (this.isSimple) {
			this.createWrappersSimple();
		} else {
			this.createWrappers();
		}
	},

	get rectangle () {
		var size = this.size;
		return new Rectangle(0, 0, size.width, size.height);
	},

	set size(size) {
		if (this.isSimple) {
			this.doms[0].size = size;
		} else {
			size = this.currentSize.set(size).toObject();
			this.wrapper.css(size);
			this.bounds .css(size);
		}
	},

	get size() {
		return this.currentSize;
	},

	destroy: function () {
		if (!this.isSimple) {
			this.wrapper.destroy();
		}
		return this;
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
	createWrappersSimple: function () {
		var size = this.currentSize.toObject();

		this.wrapper = atom.dom(LibCanvas.buffer(size,true));
		this.bounds  = this.wrapper;

		this.wrapper
			.addClass('libcanvas-app-simple')
			.appendTo( this.settings.get('appendTo') )
	},

	/** @private */
	createWrappers: function () {
		var size = this.currentSize.toObject();

		this.wrapper = atom.dom.create('div')
			.css(size)
			.addClass('libcanvas-app')
			.appendTo(this.settings.get( 'appendTo' ));

		this.bounds = atom.dom.create('div')
			.css({
				overflow: 'hidden',
				position: 'absolute'
			})
			.css(size)
			.appendTo(this.wrapper);
	}
});