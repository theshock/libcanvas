window.addEvent('domready', function () {
	var r = $random;

	var display = new LibCanvas.Engines.Tile($$('canvas')[0]);

	var matrix = display.createMatrix(20, 20, 1);

	var image = new Image;
	image.src = 'images/konqueror.png';
	image.onload = function () {
		display.update();

		(function () {
			(5).times(function () {
				matrix[r(0,19)][r(0,19)] = r(1,7);
			});
			display.update();
		}).periodical(1000);
	};

	display.addTiles({
		1 : '#000',
		2 : '#900',
		3 : '#090',
		4 : '#009',
		5 : '#990',
		6 : image,
		7 : function (ctx, rect, tile) {
			ctx.save()
				.clip(rect)
				.set('lineWidth', 6)
				.fill(rect, '#000')
				.stroke(rect, '#999')
				.restore();
		}
	});


	display.setSize(20, 20, 1);
});