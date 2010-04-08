window.App = window.App || {};

App.TabButtonCreator = {
	circle : function () {
		return new App.TabButton(
				new LibCanvas.Shapes.Circle(128, 128, 61)
			)
			.bind('click', function () {
				this.setTabValue('circle');
			}.bind(this))
			.setImageBase('circle')
			.setDrawFrom(new LibCanvas.Dot(64, 64));
	},
	octagon : function () {
		return new App.TabButton(
			new LibCanvas.Shapes.Polygon([
				[231,  67],
				[281,  67],
				[317, 103],
				[317, 153],
				[281, 189],
				[231, 189],
				[195, 153],
				[195, 103]
			])
		)
		.bind('click', function () {
			this.setTabValue('octagon');
		}.bind(this))
		.setImageBase('octagon')
		.setDrawFrom(new LibCanvas.Dot(192, 64));
	},
	rectangle : function () {
		return new App.TabButton(
			new LibCanvas.Shapes.Rectangle({
				from : [324, 68],
				size : [120, 120]
			})
		)
		.bind('click', function () {
			this.setTabValue('square');
		}.bind(this))
		.setImageBase('square')
		.setDrawFrom(new LibCanvas.Dot(320, 64));
	}
};