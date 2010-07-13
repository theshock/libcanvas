window.App = window.App || {};

(function () {

var ts = [
	new LibCanvas.Utils.Trace(),
	new LibCanvas.Utils.Trace(),
	new LibCanvas.Utils.Trace(),
	new LibCanvas.Utils.Trace()
];

App.ControllPoint = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	Implements : [
		LibCanvas.Interfaces.MouseListener,
		LibCanvas.Interfaces.Draggable,
	],
	initialize : function (point) {
		this.shape = new LibCanvas.Shapes.Circle({
			center : point,
			radius : 3
		});
	},
	draw : function () {
		this.canvas.ctx
			.fill(this.shape, '#0f0')
			.stroke(this.shape, '#606');
	}
});

App.TestShape = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	draw : function () {
		var ctx = this.canvas.ctx;
		
		if (!this.cps) {
			this.cps = [
				new LibCanvas.Point(470, 210),
				new LibCanvas.Point(480, 200),
			];
			this.cps.each(function (point) {
				this.canvas.addElement(
					new App.ControllPoint(point)
						.listenMouse()
						.draggable()
				);
			}.bind(this));
		}

		ctx.drawImage({
			image : this.canvas.getImage('apple'),
			from  : [400, 200]
		});

		ts[0].trace(this.cps[0].x + '.' + this.cps[0].y);
		ts[1].trace(this.cps[1].x + '.' + this.cps[1].y);

		ctx.beginPath()
			.moveTo(511, 205)
			.bezierCurveTo({
				1 : new LibCanvas.Point(496,202),
				2 : new LibCanvas.Point(475,225),
				p : new LibCanvas.Point(477,242)
			})
			.bezierCurveTo({
				1 : new LibCanvas.Point(490,250),
				2 : new LibCanvas.Point(519,220),
				p : new LibCanvas.Point(511,205)
			})
			.moveTo(545, 264)
			.bezierCurveTo({
				1 : new LibCanvas.Point(512,270),
				2 : new LibCanvas.Point(518,328),
				p : new LibCanvas.Point(548,331)
			})
			.bezierCurveTo({
				1 : new LibCanvas.Point(536,354),
				2 : new LibCanvas.Point(530,393),
				p : new LibCanvas.Point(483,372)
			})
			.bezierCurveTo({
				1 : new LibCanvas.Point(464,366),
				2 : new LibCanvas.Point(450,406),
				p : new LibCanvas.Point(417,341)
			})
			.bezierCurveTo({
				1 : new LibCanvas.Point(381,260),
				2 : new LibCanvas.Point(446,238),
				p : new LibCanvas.Point(460,246)
			})
			.bezierCurveTo({
				1 : new LibCanvas.Point(491,266),
				2 : new LibCanvas.Point(508,220),
				p : new LibCanvas.Point(545,264)
			})
			.stroke('#f00');
			/*
			.bezierCurveTo({
				cp1 : this.cps[0],
				cp2 : this.cps[1],
				p   : new LibCanvas.Point(545,264)
			})

			.bezierCurveTo({
				cp1 : this.cps[0],
				cp2 : this.cps[1],
				p   : new LibCanvas.Point(511,205)
			})
			 **/
		this.canvas.update();
	}
});

})();