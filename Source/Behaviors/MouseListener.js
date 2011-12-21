/*
---

name: "Behaviors.MouseListener"

description: "Canvas mouse listener"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Mouse

provides: Behaviors.MouseListener

events:
	- click
	- wheel
	- mouseover
	- mousemove
	- mouseout
	- mouseup
	- mousedown
	- away:wheel
	- away:mouseover
	- away:mousemove
	- away:mouseout
	- away:mouseup
	- away:mousedown

...
*/

// Should extends LibCanvas.Behaviors.Drawable
var MouseListener = LibCanvas.Behaviors.MouseListener = Class({
	'listenMouse.start': function () {
		this.libcanvas.mouse.subscribe(this);
	},
	'listenMouse.stop': function () {
		this.libcanvas.mouse.unsubscribe(this);
	},

	listenMouse : function (stopListen) {
		if (this.scene) {
			this.scene.mouse[stopListen ? 'unsubscribe' : 'subscribe']( this );
			return this;
		}

		var method = this[ 'listenMouse.' + (stopListen ? 'stop' : 'start') ];

		this.libcanvas ? method.call( this ) :
			this.addEvent('libcanvasSet', method );
		return this;
	}
});