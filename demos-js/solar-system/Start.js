/**
 * @author Shock, greedykid, Nutochka
 * @license LGPL
 * @url http://libcanvas.com/
 */

Solar.Start = function (libcanvas) {
	libcanvas.addProcessor('pre',
		new LibCanvas.Processors.Clearer('black')
	).start();

	var solarSystem = new Solar.System;
	libcanvas.addElement(solarSystem);

	solarSystem
		.setZIndex(1)
		.createStar({
			radius   : 40,
			color    : "#e8b832",
			stroke   : {
				width : 5,
				color : "#be2700"
			}
		}, new LibCanvas.Point(450, 450));

	solarSystem
		.createPlanets({ // radius, distance, period, color, trajectoryColor
			mercury : [  1.00,  90,    88, '#c0a08b', '#261f1b'],
			venus   : [  2.20, 120,   225, '#974c15', '#1e0e04'],
			earth   : [  2.40, 150,   365, '#344eb4', '#0a0f24'],
			mars    : [  1.30, 200,   687, '#ffb866', '#332414'],
			jupiter : [ 24.00, 250,  4300, '#f8e8d8', '#322e2b'],
			saturn  : [ 20.00, 310, 10832, '#807061', '#191512'],
			uranus  : [ 10.25, 350, 30800, '#8ea0ac', '#1d2023'],
			neptune : [ 10.00, 400, 60190, '#5989dd', '#121c2d']
		}).twist();
};