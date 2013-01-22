/*
---

name: "App.Dom"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.Dom

...
*/


/** @class App.Dom */
declare( 'LibCanvas.App.Dom', {
	/** @private
	 *  @property {Size} */
	currentSize: null,
	
	/** @private
	 *  @property {App.Container} */
	container: null,

	/** @private
	 *  @property {Point} */
	shift: null,

	/** @private */
	z: 0,

	initialize: function (container, settings) {
		this.container = container;
		this.settings  = new Settings(settings);
		this.shift = new Point(0,0);
		this.name  = this.settings.get('name') || '';
		this.createSize();
		this.createElement();
	},

	set zIndex (z) {
		this.z = z;
		if (!this.container.isSimple) {
			this.element.css('zIndex', z);
		}
	},

	get zIndex () {
		return this.z;
	},

	set size(size) {
		size = this.currentSize.set(size);

		this.canvas.width  = size.width ;
		this.canvas.height = size.height;
	},

	get size() {
		return this.currentSize;
	},

	destroy: function () {
		this.element.destroy();
		this.size = new Size(0,0);
	},

	/**
	 * @param {Point} shift
	 * @returns {App.Dom}
	 */
	addShift: function ( shift ) {
		var newShift = this.getShift().move( shift );
		this.element.css({
			marginLeft: newShift.x,
			marginTop : newShift.y
		});
		return this;
	},

	/**
	 * @param {Point} shift
	 * @returns {App.Dom}
	 */
	setShift: function (shift) {
		return this.addShift( this.shift.diff(shift) );
	},

	/** @returns {Point} */
	getShift: function () {
		if (this.container.isSimple) {
			throw new Error('Shift not available in Simple mode');
		}

		return this.shift;
	},

	/** @private */
	createSize: function () {
		var size = this.settings.get('size');

		if (this.container.isSimple) {
			this.currentSize = this.container.size;
			if (size) {
				this.currentSize.set(size);
			}
		} else {
			this.currentSize = size || this.container.size.clone();
		}


	},

	/** @private */
	createElement: function () {
		if (this.container.isSimple) {
			this.createElementSimple();
		} else {
			this.createElementNormal();
		}
	},

	/** @private */
	createElementNormal: function () {
		this.canvas  = new LibCanvas.Buffer(this.size, true);

		this.element = atom.dom(this.canvas);

		this.element
			.attr({ 'data-name': this.name  })
			.css ({ 'position' : 'absolute' })
			.appendTo( this.container.bounds );

		this.zIndex = this.settings.get('zIndex') || 0;
	},

	/** @private */
	createElementSimple: function () {
		this.element = this.container.wrapper;

		this.canvas  = this.element.first;
		this.canvas.width  = this.size.width;
		this.canvas.height = this.size.height;
	}
});