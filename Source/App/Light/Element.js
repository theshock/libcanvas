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
	configure: function () {
		var behaviors = this.settings.get('behaviors');

		this.animate = new atom.Animatable(this).animate;

		Behaviors.attach( this, [ 'Draggable', 'Clickable' ], this.redraw );
		if (this.settings.get('mouse') !== false) {
			this.listenMouse();
		}
	},

	move: function (point) {
		this.shape.move(point);
		this.redraw();
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