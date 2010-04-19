/**
 * @author Shock, greedykid, Nutochka
 * @license LGPL
 * @url http://freecr.ru/libcanvas/
 */

window.addEvent('domready', function () {
	new LibCanvas.Canvas2D($$('canvas')[0])
		.setFps(60)
		.fpsMeter(30)
		.setConfig({
			background  : '#EFEBE7',
			images      : App.imagesList
		})
		.start(function () {
			new LibCanvas.Utils.ProjectiveTexture(this.images['testImage0'])
				.setContext(this.ctx.canvas.getContext('2d'))
				.setQuality(64, 4)
				.render([
				  [  0,   0],
				  [200, 100],
				  [  0, 600],
				  [200, 500]
				])
			new LibCanvas.Utils.ProjectiveTexture(this.images['testImage0'])
				.setContext(this.ctx.canvas.getContext('2d'))
				.setQuality(64, 4)
				.render([
				  [800,   0],
				  [600, 100],
				  [800, 600],
				  [600, 500]
				])
		});
});