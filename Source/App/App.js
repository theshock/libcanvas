/*
---

name: "App"

description: "LibCanvas.App"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: App

...
*/

/** @class App */
LibCanvas.declare( 'LibCanvas.App', 'App', {
	initialize: function (settings) {
		this.bindMethods( 'tick' );

		this.layers    = [];
		this.settings  = new Settings({ appendTo: 'body' }).set(settings);
		this.container = new App.Container(
			this.settings.subset(['simple', 'size', 'appendTo'])
		);
		this.resources = new Registry();

		atom.frame.add( this.tick );
	},

	destroy: function () {
		atom.array.invoke( this.layers, 'destroy' );
		atom.frame.remove( this.tick );
		this.container.destroy();
	},

	get rectangle () {
		return this.container.rectangle;
	},

	/**
	 * return "-1" if left is higher, "+1" if right is higher & 0 is they are equals
	 * @param {App.Element} left
	 * @param {App.Element} right
	 * @returns {number}
	 */
	zIndexCompare: function (left, right, inverted) {
		var leftZ, rightZ, factor = inverted ? -1 : +1;

		if (!left  || !left .layer) throw new TypeError( 'Wrong left element'  );
		if (!right || !right.layer) throw new TypeError( 'Wrong right element' );


		 leftZ =  left.layer.dom.zIndex;
		rightZ = right.layer.dom.zIndex;

		if (leftZ > rightZ) return -1 * factor;
		if (leftZ < rightZ) return +1 * factor;

		 leftZ =  left.zIndex;
		rightZ = right.zIndex;

		if (leftZ > rightZ) return -1 * factor;
		if (leftZ < rightZ) return +1 * factor;

		return 0;
	},

	createLayer: function (settings) {
		if (this.settings.get('simple') && this.layers.length) {
			throw new Error('You can create only one layer in "Simple" mode');
		}

		var layer = new App.Layer(this, settings);
		this.layers.push(layer);
		return layer;
	},

	tick: function (time) {
		atom.array.invoke(this.layers, 'tick', time);
	}
});

var App = LibCanvas.App;