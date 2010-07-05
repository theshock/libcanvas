/**
 * @author Shock, greedykid, Nutochka
 * @license LGPL
 * @url http://freecr.ru/libcanvas/
 */

window.addEvent('domready', function () {
	var canvas = new LibCanvas.Canvas2D($$('canvas')[0])
		.setFps(60)
		.fpsMeter(15)
		.setConfig({
			background : '#EFEBE7',
			images     : App.imagesList
		})
		.listenMouse();
	for (var i = 50; i--;) {
		var testElem = new App.TestElem()
			.setShape(
				new LibCanvas.Shapes.Rectangle(
					$random(5, 750),
					$random(5, 550),
					$random(5, 50),
					$random(5, 50)
				)
			)
			.setZIndex($random(5, 50))
			.listenMouse()
			.draggable(1)
			.clickable()
		canvas.addElement(testElem);
	}
	canvas.start();
});