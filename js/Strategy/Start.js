window.addEvent('domready', function () {
	var toSmall = function (image) {
		var buffer = LibCanvas.Buffer(32, 32);
		buffer.getContext('2d-libcanvas')
			.drawImage({
				image : image,
				draw : [0,0,32,32]
			});
		return buffer;
	}

	new LibCanvas.Utils.ImagePreloader({
		'car'   : 'images/car.png',
		'here'  : 'images/here.png',
		'water' : 'images/water.png',
		'grass' : 'images/grass.jpg',
		'sand'  : 'images/sand.png'
	}).ready(function (ip) {
		var carImage  = toSmall(ip.images.car);
		var hereImage = toSmall(ip.images.here);

		var canvas = new LibCanvas.Canvas2D($$('canvas')[0]);
		canvas.autoUpdate = 'onRequest';
		canvas.fps        = 60;
		canvas.fpsMeter(30).listenMouse();

		canvas.addProcessor('pre',
			new LibCanvas.Processors.Clearer('black')
		).start();

		var strategy = new LibCanvas.Engines.TopDown();

		strategy.cellSize(32, 32);

		strategy.addCells({
			1 : {
				fn : toSmall(ip.images.water),
				traverse : ['sea', 'air']
			},
			2 : {
				fn : toSmall(ip.images.sand),
				traverse : ['land', 'air']
			},
			3 : {
				fn : toSmall(ip.images.grass),
				traverse : ['land', 'air']
			}
		});

		strategy.createMap([
			[1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2],
			[1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2],
			[2, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2, 3, 3, 3, 3, 3, 2, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2, 3, 3, 3, 3, 3],
			[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[3, 3, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3],
			[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 1, 3, 3],
			[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3],
			[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
			[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3],
			[3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 3, 3],
			[1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 3, 3],
			[3, 3, 1, 1, 3, 1, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3],
			[3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3],
			[3, 3, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 3, 3],
			[2, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3],
			[1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		]);

		strategy.listenMouse();

		strategy.map.update();

		canvas.addElement(strategy);

		var cars = [];

		([
			[ 2, 2], [ 3, 3], [ 6, 3], [ 6, 8],
			[15, 2], [15, 7], [ 1, 7], [ 5, 7],
			[18,17], [26,18], [26,15], [23, 5],
			[18,18], [31,18], [20, 9], [25,11],
			[14,14], [ 3,18], [ 0,14], [ 1,10],
			[ 5,12], [15,12], [22,13], [22,3],
		]).each(function (coord) {
			var car = new LibCanvas.Engines.TopDown
				.Unit(strategy, carImage)
				.setZIndex(10);

			car.setCoord(new LibCanvas.Point(coord[0], coord[1]));
			car.type = 'land';
			canvas.addElement(car);
			cars.push(car);
			car.bind(['move', 'rotate'], function () {
				canvas.update();
			});
		});


		var here = new LibCanvas.Engines.TopDown
			.Unit(strategy, hereImage)
			.setCoord(new LibCanvas.Point(3, 3))
			.setZIndex(5);

		here.type = 'land';

		canvas.addElement(here);



		strategy.bind('click', function (event, e) {
			here.moveTo(strategy.map.getCell({x:e.offsetX, y:e.offsetY}));
			var step = function (car) {
				var diff = car.cellCoord.diff(here.cellCoord);
				if (!diff.x && !diff.y) {
					return;
				}
				var s = function () {
					step(car);
				};
				if (diff.x.abs() > diff.y.abs()) {
					car.rotateTo(diff.x > 0 ? 'right' : 'left', function () {
						car.move(s);
					});
				} else {
					car.rotateTo(diff.y > 0 ? 'bottom' : 'top', function () {
						car.move(s);
					});
				}
			};
			cars.each(step);
			canvas.update();
		});
	})
});