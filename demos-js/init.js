/**
 * @author Shock, greedykid, Nutochka
 * @license LGPL
 * @url http://libcanvas.com/
 */

$extend(window, {
	Apps       : {},
	Interface  : {},
	PathBuider : {},
	Solar      : {},
	Solitaire  : {},
	Isometric  : {},
	updateCanvas :  function (canvas) {
		return function () {
			canvas.update();
		};
	}
});

window.addEvent('domready', function () {
	$$('canvas').each(function (canvas) {
		var app = canvas.getAttribute('app');
		var libcanvas = new LibCanvas.Canvas2D(canvas);
		libcanvas.autoUpdate = 'onRequest';
		libcanvas.fps        = 60;
		libcanvas.listenMouse();
		new Apps[Apps[app] ? app : 'Error'](libcanvas, app);
	});
});