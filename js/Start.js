/**
 * @author Shock, greedykid, Nutochka
 * @license LGPL
 * @url http://freecr.ru/libcanvas/
 */

window.addEvent('domready', function () {
	new LibCanvas.Canvas2D($$('canvas')[0])
		.setFps(60)
		.fpsMeter(15)
		.setConfig({
			background : '#EFEBE7',
			images     : App.imagesList
		})
		.listenMouse()
		.addElement(
			new App.TestElem(
				new LibCanvas.Shapes.Rectangle(
					50, 50, 100, 100
				)
			).setZIndex(2)
		)
		.addElement(
			new App.TestElem(
				new LibCanvas.Shapes.Rectangle(
					100, 100, 100, 100
				)
			).setZIndex(4)
		)
		.addElement(
			new App.TestElem(
				new LibCanvas.Shapes.Circle(
					125, 125, 50
				)
			).setZIndex(3)
		)
		.start();
});