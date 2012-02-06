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


var App = declare( 'LibCanvas.App', {
	initialize: function (settings) {
		this.bindMethods( 'tick' );

		this.scenes    = [];
		this.settings  = new Settings(settings);
		this.container = new App.Container(
			this.settings.get(['size', 'appendTo', 'invoke'])
		);
		this.resources = new Registry();

		atom.frame.add( this.tick );
	},

	/**
	 * return "-1" if left is higher, "+1" if right is higher & 0 is they are equals
	 * @param {App.Element} left
	 * @param {App.Element} right
	 * @returns {number}
	 */
	zIndexCompare: function (left, right, inverted) {
		var leftZ, rightZ, factor = inverted ? -1 : +1;

		if (!left  || !left.scene ) throw new TypeError( 'Wrong left element'  );
		if (!right || !right.scene) throw new TypeError( 'Wrong right element' );


		 leftZ =  left.scene.layer.zIndex;
		rightZ = right.scene.layer.zIndex;

		if (leftZ > rightZ) return -1 * factor;
		if (leftZ < rightZ) return +1 * factor;

		 leftZ =  left.zIndex;
		rightZ = right.zIndex;

		if (leftZ > rightZ) return -1 * factor;
		if (leftZ < rightZ) return +1 * factor;

		return 0;
	},

	createScene: function (settings) {
		var scene = new App.Scene(this, settings);
		this.scenes.push(scene);
		return scene;
	},

	tick: function (time) {
		atom.array.invoke(this.scenes, 'tick', time);
	}
});