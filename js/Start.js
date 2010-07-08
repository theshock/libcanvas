/**
 * @author Shock, greedykid, Nutochka
 * @license LGPL
 * @url http://freecr.ru/libcanvas/
 */

window.addEvent('domready', function () {
	App.Start.canvas = new LibCanvas
		.Canvas2D($$('canvas')[0])
		.config({
			fps         : 50,
			fpsMeter    : 75,
			background  : '#EFEBE7',
			images      : App.imagesList,
			progressBar : App.progressBarStyle
		})
		.listenMouse()
		.start();
	if (App.Start[window.method]) {
		App.Start[window.method]();
	} else {
		App.Start['de']();
	}
});