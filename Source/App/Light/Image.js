/*
---

name: "App.Light.Image"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App.Light.Element

provides: App.Light.Image

...
*/

/** @class App.Light.Image */
App.Light.Image = atom.declare( 'LibCanvas.App.Light.Image', App.Light.Element, {
	get currentBoundingShape () {
		return this.shape.clone().fillToPixel();
	},

	renderTo: function (ctx) {
		ctx.drawImage({
			image: this.settings.get('image'),
			draw : this.shape
		})
	}
});