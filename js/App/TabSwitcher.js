window.App = window.App || {};

App.TabSwitcher = new Class({
	elems : {},
	setTabValue : function (value) {
		if (this.active) {
			this.canvas.rmElement(this.active);
		}
		this.active = new App.TabValue({
			image : this.canvas.images[value + '-tab'],
			from  : [131, 200]
		});
		this.canvas.addElement(this.active);
		return this;
	},
	createElems : function () {
		this.elems = {

			'circle' :
				new App.TabButton(
					new LibCanvas.Shapes.Circle(128, 128, 61)
				)
				.bind('click', function () {
					this.setTabValue('circle');
				}.bind(this))
				.setImageBase('circle')
				.setDrawFrom(new LibCanvas.Dot(64, 64)),

			'octagon' :
				new App.TabButton(
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
				.setDrawFrom(new LibCanvas.Dot(192, 64)),

			'rectangle' :
				new App.TabButton(
					new LibCanvas.Shapes.Rectangle({
						from : [324, 68],
						size : [120, 120]
					})
				)
				.bind('click', function () {
					this.setTabValue('square');
				}.bind(this))
				.setImageBase('square')
				.setDrawFrom(new LibCanvas.Dot(320, 64)),
		};
		return this;
	},
	bindElems : function () {
		$H(this.elems).each(function (elem) {
			this.canvas.addElement(elem);
		}.bind(this));
		return this;
	},
	setCanvas : function (canvas) {
		this.canvas = canvas;
		this.createElems().bindElems();
		return this;
	},
	draw : function () {
		
	}
});