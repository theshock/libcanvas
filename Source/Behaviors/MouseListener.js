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
	- mouseover
	- mousemove
	- mouseout
	- mouseup
	- mousedown
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
		this.libcanvas.mouse.subscribe(this);
	},

	listenMouse : function (stopListen) {
		var method = this[ 'listenMouse.' + (stopListen ? 'stop' : 'start') ];

		this.libcanvas ? method.call( this ) :
			this.addEvent('libcanvasSet', method );
		return this;
	}
});