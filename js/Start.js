/**
 * @author Shock
 * @license LGPL
 */

window.addEvent('domready', function () {
	var mouse = new LibCanvas.Utils.Trace();
	new LibCanvas.Canvas2D($$('canvas')[0])
		.setFps(50)
		.fpsMeter(20)
		.setConfig({
			background : '#EFEBE7',
			images     : {
				'circle-standart'  : 'icons/circle-gray.png',
				'circle-hover'     : 'icons/circle-green.png',
				'circle-active'    : 'icons/circle-red.png',
				'circle-tab'       : 'icons/circle-big.png',

				'octagon-standart' : 'icons/octagon-gray.png',
				'octagon-hover'    : 'icons/octagon-green.png',
				'octagon-active'   : 'icons/octagon-red.png',
				'octagon-tab'      : 'icons/octagon-big.png',

				'square-standart'  : 'icons/square-gray.png',
				'square-hover'     : 'icons/square-green.png',
				'square-active'    : 'icons/square-red.png',
				'square-tab'       : 'icons/square-big.png',
			},
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