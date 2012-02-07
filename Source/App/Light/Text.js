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


App.Light.Text = atom.declare( 'LibCanvas.App.Light.Text', {
	parent: App.Element,

	prototype: {
		get content () {
			return this.settings.get('content') || '';
		},

		set content (c) {
			if (c != this.content) {
				this.redraw();
				this.settings.set('content', String(c) || '');
			}
		},

		renderTo: function (ctx) {
			var
				style = this.settings.get('style') || {},
				bg    = this.settings.get('background');
			ctx.save();
			if (bg) ctx.fill( this.shape, bg );
			ctx.text(atom.core.append({
				text: this.content,
				to  : this.shape
			}, style));
			ctx.restore();
		}
	}
});