/*
---

name: "App.Light"

description: "LibCanvas.App.Light"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.Light

...
*/

/** @class App.Light */
declare( 'LibCanvas.App.Light', {

	initialize: function (size, settings) {
		var mouse, mouseHandler;

		this.settings = new Settings({
			size    : Size.from(size),
			name    : 'main',
			mouse   : true,
			invoke  : false,
			simple  : true,
			appendTo: 'body',
			intersection: 'auto'
		}).set(settings || {});

		this.app   = new App( this.settings.subset(['size', 'appendTo', 'simple']) );
		this.layer = this.app.createLayer(this.settings.subset(['name','invoke','intersection']));
		if (this.settings.get('mouse') === true) {
			mouse = new Mouse(this.app.container.bounds);
			mouseHandler = new App.MouseHandler({ mouse: mouse, app: this.app });

			this.app.resources.set({ mouse: mouse, mouseHandler: mouseHandler });
		}
	},

	createVector: function (shape, settings) {
		settings = atom.core.append({ shape:shape }, settings || {});
		return new App.Light.Vector(this.layer, settings);
	},

	createText: function (shape, style, settings) {
		settings = atom.core.append({ shape: shape, style: style }, settings);
		return new App.Light.Text(this.layer, settings);
	},

	createImage: function (shape, image, settings) {
		return new App.Light.Image(this.layer, atom.core.append({
			shape: shape, image: image
		}, settings));
	},

	get mouse () {
		return this.app.resources.get( 'mouse' );
	},

	get mouseHandler () {
		return this.app.resources.get( 'mouseHandler' );
	}

});