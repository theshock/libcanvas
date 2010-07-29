/*
---
description: Canvas mouse listener

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Interfaces.MouseListener]
*/ 

/**
 * events :
 *
 * click
 *
 * mouseover
 * mousemove
 * mouseout
 * mouseup
 * mousedown
 *
 * away:mouseover
 * away:mousemove
 * away:mouseout
 * away:mouseup
 * away:mousedown
 */

// Should extends LibCanvas.Interfaces.Drawable
LibCanvas.Interfaces.MouseListener = new Class({
	listenMouse : function (stopListen) {
		return this.bind('libcanvasSet', function () {
			this.libcanvas.mouse[
				stopListen ? "unsubscribe" : "subscribe"
			](this);
		}.bind(this));
	}
});