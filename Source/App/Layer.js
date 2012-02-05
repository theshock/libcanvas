/*
---

name: "App.Layer"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.Layer

...
*/


App.Layer = declare( 'LibCanvas.App.Layer', {
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
		this.zIndex = this.settings.get('zIndex') || 0;
	},

	set zIndex (z) {
		this.z = z;
		this.element.css('zIndex', z);
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

	/**
	 * @param {Point} shift
	 * @returns {App.Layer}
	 */
	addShift: function ( shift ) {
		shift = Point( shift );
		var newShift = this.shift.move( shift );
		this.element.css({
			marginLeft: newShift.x,
			marginTop : newShift.y
		});
		return this;
	},

	/**
	 * @param {Point} shift
	 * @returns {App.Layer}
	 */
	setShift: function (shift) {
		return this.addShift( this.shift.diff(shift) );
	},

	/** @returns {Point} */
	getShift: function () {
		return this.shift;
	},

	/** @private */
	createSize: function () {
		this.currentSize = this.settings.get('size') || this.container.size.clone();
	},

	/** @private */
	createElement: function () {
		this.canvas  = new LibCanvas.Buffer(this.size,true);
		this.element = atom.dom(this.canvas)
			.attr({ 'data-name': this.name  })
			.css ({ 'position' : 'absolute' })
			.appendTo( this.container.bounds );
	}
});