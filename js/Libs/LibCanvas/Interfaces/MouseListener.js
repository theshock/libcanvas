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
		return this.bind('canvasSetted', function () {
			this.canvas.mouse[
				stopListen ? "unsubscribe" : "subscribe"
			](this);
		}.bind(this));
	}
});