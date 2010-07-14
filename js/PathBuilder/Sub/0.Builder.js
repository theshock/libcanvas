PathBuilder.Builder = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	init : function () {
		if (!this.shape) {
			this.shape = new LibCanvas.Shapes.Path.Builder();
			this.shape.move(this.moveablePoint('#fc0'))
			this.canvas.update();
		}
		return this;
	},
	lastZ : 0,
	points : [],
	lastPoint : new LibCanvas.Point(500, 300),
	addPoints : function (points) {
		this.points.push($splat(points));
		return points;
	},
	moveablePoint : function (color) {
		this.init();
		this.lastPoint = new LibCanvas.Point([
			this.lastPoint.x + $random(-40, 40),
			this.lastPoint.y + $random(-40, 40),
		]);
		var drawable = new PathBuilder.Point(color)
			.setShape(this.lastPoint)
			.listenMouse()
			.draggable()
			//.clickable()
			.setZIndex(++this.lastZ)
			.bind('moveDrag', canvasUpdate(this))
			//.bind('statusChanged', canvasUpdate(this));
		this.canvas.addElement(drawable);
		this.lastPoint.drawable = drawable;
		return this.lastPoint;
	},
	line : function () {
		this.init();
		this.shape.line(this.addPoints(
			this.moveablePoint('#ff0')
		));
		this.canvas.update();
		return this;
	},
	move : function () {
		this.init();
		this.shape.move(this.addPoints(
			this.moveablePoint('#fff')
		));
		this.canvas.update();
		return this;
	},
	curve : function () {
		this.init();
		var lp = this.lastPoint;
		var p1 = this.moveablePoint('#f0f');
		var p2 = this.moveablePoint('#0ff');
		var to = this.moveablePoint('#ff0');

		p1.drawable.setConnected(lp);
		p2.drawable.setConnected(to);

		this.shape.curve(this.addPoints([
			p1, p2, to
		]));
		this.canvas.update();
		return this;
	},
	pop : function () {
		this.init();
		(this.points.pop() || []).each(function (point) {
			this.canvas.rmElement(point.drawable);
		}.bind(this));
		this.shape.pop();
		this.canvas.update();
	},
	draw : function () {
		this.init();
		this.canvas.ctx
			.save()
			.set('lineWidth', 3)
			.stroke(this.shape.build(), '#696')
			.fill(this.shape.build(), '#ded')
			.restore();
	}
});