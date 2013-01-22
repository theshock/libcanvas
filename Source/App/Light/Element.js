/*
---

name: "App.Light.Element"

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

provides: App.Light.Element

...
*/

/** @class App.Light.Vector */
App.Light.Element = atom.declare( 'LibCanvas.App.Light.Element', App.Element, {

	get behaviors () {
		throw new Error( 'Please, use `element.clickable` & `element.draggable` instead' );
	},

	clickable : null,
	draggable : null,
	animatable: null,

	configure: function () {
		this.clickable  = new App.Clickable(this, this.redraw);
		this.draggable  = new App.Draggable(this, this.redraw);
		this.animatable = new atom.Animatable(this);
		this.animate    = this.animatable.animate;

		if (this.settings.get('mouse') !== false) {
			this.listenMouse();
		}
	},

	/**
	 * Override by Animatable method
	 */
	animate: function(){},

	listenMouse: function (unsubscribe) {
		var method = unsubscribe ? 'unsubscribe' : 'subscribe';
		return this.layer.app.resources.get('mouseHandler')[method](this);
	},

	destroy: function method () {
		this.listenMouse(true);
		return method.previous.call(this);
	}
});