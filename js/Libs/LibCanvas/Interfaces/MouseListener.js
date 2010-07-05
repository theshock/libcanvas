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
	listenMouse : function () {
		this.bind('canvasSetted', function () {
			this.canvas.mouse.subscribe(this);
		}.bind(this));
		this.event = this.binds;
		return this;
	}
});