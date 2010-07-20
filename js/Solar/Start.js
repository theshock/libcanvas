window.addEvent('domready', function () {
	var canvas = new LC.Canvas2D($$('canvas')[0]);
	canvas.autoUpdate = 'onRequest';
	canvas.fps        = 60;
	canvas.fpsMeter(30);

	canvas.addProcessor('pre',
		new LC.Processors.Clearer('black')
	).start();

	var solarSystem = new Solar.System;
	canvas.addElement(solarSystem);

	solarSystem
		.setZIndex(1)
		.createStar({
			radius   : 50,
			color    : "#e8b832",
			stroke   : {
				width : 10,
				color : "#be2700"
			}
		}, new Point(525, 525));

	solarSystem
		.createPlanets({ // radius, distance, period, color, trajectoryColor
			mercury : [  1.00, 175,    88, '#c0a08b', '#261f1b'],
			venus   : [  2.42, 198,   225, '#974c15', '#1e0e04'],
			earth   : [  2.54, 213,   365, '#344eb4', '#0a0f24'],
			mars    : [  1.36, 233,   687, '#ffb866', '#332414'],
			jupiter : [ 24.00, 313,  4300, '#f8e8d8', '#322e2b'], // r = 28.56
			saturn  : [ 20.00, 366, 10832, '#807061', '#191512'], // r = 24.12
			uranus  : [ 10.22, 443, 30800, '#8ea0ac', '#1d2023'],
			neptune : [ 10.02, 500, 60190, '#5989dd', '#121c2d']
		}).twist();
});