window.App = window.App || {};

App.EventsTester = new Class({
	initialize : function (shape) {
		this.shape  = shape;
	},
	setCanvas : function (canvas) {
		this.canvas = canvas;
		this.canvas.mouse.subscribe(this);
		return this;
	},
	getShape : function () {
		return this.shape;
	},
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
	event : function (type, e) {
		this.traces = this.traces || {};
		this.traces[type] = this.traces[type] || new LibCanvas.Utils.Trace();
		this.traces[type].trace(
			'Event "' + type + '" ' +
			this.canvas.mouse.debug()
		);
		// You should use e.offsetX && e.offsetY if you want to know
		// in what coords mouse out while away:mouseout and mouseout
		// to another element (not canvas)
		return this;
	},
	draw : function () {
		this.canvas.ctx
			.save()
			.set('fillStyle', '#FFA84B')
			.fill(this.getShape())
			.restore();
		return this;
	}
});