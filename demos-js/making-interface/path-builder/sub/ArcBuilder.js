PathBuilder.ArcBuilder = new Class({
	Extends : PathBuilder.Builder,
	createArg : function (center, acw) {
		return {
			circle : new LibCanvas.Shapes.Circle({
				center : center, radius : 0
			}),
			angle  : { from : 0, to : 0 },
			acw : acw
		};
	},
	lengthen : function (point, from, to) {
		var dist = point.distanceTo(from);
		var toD  = from.distanceTo(to);
		if (dist != toD) {
			point.set(
				(point.x - from.x) * toD / dist + from.x,
				(point.y - from.y) * toD / dist + from.y
			);
		}
	},
	arc : function (acw) {
		this.init();
		var center = this.moveablePoint('#933');
		var start  = this.moveablePoint('#393');
		var end    = this.moveablePoint('#339');

		start.drawable.setConnected(center);
		end.drawable.setConnected(center);

		center.drawable
			.link(start.drawable)
			.link(end.drawable);
			
		this.addPoints([
			center, start, end
		]);

		var arg = this.createArg(center, acw);

		var countRadius = function () {
			arg.circle.radius = center.distanceTo(start);
		};
		var countStart = function () {
			arg.angle.start = start.angleTo(center);
		};
		var countEnd = function () {
			arg.angle.end = end.angleTo(center);
		};
		var lengthenStart = function () {
			this.lengthen(start, center, end);
		}.bind(this);
		var lengthenEnd = function () {
			this.lengthen(end, center, start);
		}.bind(this);

		start.bind('moved', countRadius);
		start.bind('moved', countStart);
		start.drawable.bind(['moveDrag', 'endDrag'], lengthenEnd);
		end.bind('moved', countEnd);
		end.drawable.bind(['moveDrag', 'endDrag'], lengthenStart);
		end.drawable.bind(['moveDrag', 'endDrag'], countRadius);
		center.drawable.bind(['moveDrag', 'endDrag'], lengthenStart);
		center.drawable.bind(['moveDrag', 'endDrag'], countRadius);

		countRadius();
		countStart();
		countEnd();
		lengthenEnd();
		this.shape.arc(arg);
		this.canvas.update();
		return this;
	}
});