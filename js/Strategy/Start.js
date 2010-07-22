window.addEvent('domready', function () {
	var hereImage = new Image;
	hereImage.src = 'images/here.png';
	hereImage.onload = function () {
		var carImage = new Image;
		carImage.src = 'images/car.png';
		carImage.onload = function () {
			var canvas = new LibCanvas.Canvas2D($$('canvas')[0]);
			canvas.autoUpdate = 'onRequest';
			canvas.fps        = 60;
			canvas.fpsMeter(30).listenMouse();

			canvas.addProcessor('pre',
				new LibCanvas.Processors.Clearer('black')
			).start();

			var strategy = new LibCanvas.Engines.TopDown();

			strategy.cellSize(64, 64);

			strategy.addCells({
				1 : {
					fn : '#009',
					traverse : ['sea', 'air']
				},
				2 : {
					fn : '#c90',
					traverse : ['land', 'air']
				},
				3 : {
					fn : '#090',
					traverse : ['land', 'air']
				}
			});

			strategy.createMap([
				[1, 1, 1, 1, 1, 1, 1, 2],
				[1, 1, 2, 2, 2, 2, 2, 2],
				[2, 2, 2, 2, 3, 3, 3, 3],
				[3, 3, 3, 3, 3, 3, 3, 3],
				[3, 3, 3, 1, 1, 1, 3, 3],
				[3, 3, 1, 1, 3, 1, 3, 3],
				[3, 3, 1, 3, 3, 3, 3, 3],
				[3, 3, 3, 3, 3, 3, 3, 3]
			]);

			strategy.listenMouse();

			strategy.map.update();

			canvas.addElement(strategy);

			var car = new LibCanvas.Engines.TopDown
				.Unit(strategy, carImage)
				.setCoord(new LibCanvas.Point(3, 3))
				.setZIndex(10);

			car.type = 'land';

			var here = new LibCanvas.Engines.TopDown
				.Unit(strategy, hereImage)
				.setCoord(new LibCanvas.Point(3, 3))
				.setZIndex(5);

			here.type = 'land';

			canvas.addElement(car);
			canvas.addElement(here);


			car.bind(['move', 'rotate'], function () {
				canvas.update();
			});

			strategy.bind('click', function (event, e) {
				here.moveTo(strategy.map.getCell({x:e.offsetX, y:e.offsetY}));
				var step = function () {
					var diff = car.cellCoord.diff(here.cellCoord);
					if (!diff.x && !diff.y) {
						return;
					}
					if (diff.x.abs() > diff.y.abs()) {
						car.rotateTo(diff.x > 0 ? 'right' : 'left', function () {
							car.move(step);
						});
					} else {
						car.rotateTo(diff.y > 0 ? 'bottom' : 'top', function () {
							car.move(step);
						});
					}
				};
				step();
				canvas.update();
			});
		}
	}
});