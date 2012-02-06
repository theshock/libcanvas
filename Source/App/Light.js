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

App.Light = declare( 'LibCanvas.App.Light', {

	initialize: function (settings) {
		var mouse, mouseHandler;

		this.settings = new Settings({ name: 'main' }).set(settings);
		this.app   = new App( this.settings.get(['size', 'appendTo']) );
		this.scene = this.app.createScene(this.settings.get(['name','invoke']));
		if (this.settings.get('mouse') === true) {
			mouse = new Mouse(this.app.container.bounds);
			mouseHandler = new App.MouseHandler({ mouse: mouse, app: this.app });

			this.app.resources.set({ mouse: mouse, mouseHandler: mouseHandler });
		}
	},

	createVector: function (settings) {
		return new App.Vector(this.scene, settings);
	}

});