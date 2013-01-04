/*
---

name: "App.Light.Text"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App
	- App.Light

provides: App.Light.Text

...
*/

/** @class App.Light.Text */
atom.declare( 'LibCanvas.App.Light.Text', App.Element, {
	get style () {
		return this.settings.get('style') || {};
	},

	get content () {
		return this.style.text || '';
	},

	set content (c) {
		if (Array.isArray(c)) c = c.join('\n');

		if (c != this.content) {
			this.redraw();
			this.style.text = String(c) || '';
		}
	},

	renderTo: function (ctx) {
		var bg    = this.settings.get('background');

		if (bg) ctx.fill( this.shape, bg );
		ctx.text(atom.core.append({
			to  : this.shape
		}, this.style));
	}
});