/*
---

name: "Behaviors.MouseListener"

description: "Canvas mouse listener"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

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
LibCanvas.Behaviors.MouseListener = atom.Class({
	listenMouse : function (stopListen) {
		return this.addEvent('libcanvasSet', function () {
			var command = stopListen ? "unsubscribe" : "subscribe";
			this.libcanvas.mouse[command](this);
		}.context(this));
	}
});