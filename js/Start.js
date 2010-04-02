/**
 * @author Shock
 * @license LGPL
 */


window.addEvent('domready', function () {
	var mouseTrace = new LibCanvas.Trace();

	var imPr = new LibCanvas.ImagePreloader({
		'ufo' : 'ufo320x320.jpg'
	});
				
	new LibCanvas.Canvas2D($$('canvas')[0])
		.setFps(50)
		.fpsMeter(20)
		.start(function () {
			mouseTrace.trace(this.mouse.debug());

			// Bg color is dark green
			this.ctx.fillAll('#030');

			// if image downloaded ad mouse is in canvas
			if (imPr.ready && this.mouse.inCanvas) {
				// Drawing image under mouse
				this.ctx.drawImage({
					image : imPr.images['ufo'],
					crop  : [80, 80, 160, 160],
					draw  : new LibCanvas.Shapes.Rectangle({
						from : this.mouse.dot,
						size : [160, 160]
					})
				})

				// Draw red circle under mouse
				this.ctx.save()
					.set('fillStyle', 'red')
					.fill(new LibCanvas.Shapes.Circle({
						center : this.mouse.dot,
						radius : 5
					}))
					.restore();
			}
		});
});
