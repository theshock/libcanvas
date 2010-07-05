/**
 * @author Shock, greedykid, Nutochka
 * @license LGPL
 * @url http://freecr.ru/libcanvas/
 */

window.addEvent('domready', function () {
	new LibCanvas
		.Canvas2D($$('canvas')[0])
		.config({
			fps         : 20,
			fpsMeter    : 10,
			background  : '#EFEBE7',
			images      : App.imagesList,
			progressBar : App.progressBarStyle
		})
		.start();
});