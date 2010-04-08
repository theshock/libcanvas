/**
 * @author Shock, greedykid, Nutochka
 * @license LGPL
 * @url http://freecr.ru/libcanvas/
 */

window.addEvent('domready', function () {
	// I'd like to know current mouse coord
	var mouse = new LibCanvas.Utils.Trace();
	
	new LibCanvas.Canvas2D($$('canvas')[0])
		.setFps(50)
		.fpsMeter(20)
		.setConfig({
			background  : '#EFEBE7',
			images      : App.imagesList,
			progressBar : App.progressBarStyle
		})
		.addElement(new App.EventsTester(
			new LibCanvas.Shapes.Circle(720, 480, 85)
		))
		.addElement(new App.TabSwitcher())
		.start(function () {
			mouse.trace('Mouse: ' + this.mouse.debug());
		});
});

