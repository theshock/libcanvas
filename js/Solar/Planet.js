Solar.Planet = new Class({
	Extends : Solar.Object,

	distance : 0,
	period   : 0,
	name     : '',
	trajectoryColor : '#111',
	paramsList : ['radius', 'distance', 'period', 'color', 'trajectoryColor'],
	initialize : function () {
		this.parent.apply(this,arguments);
		this.initTrajectory();
	},
	initTrajectory : function () {
		this.trajectory = new Shapes.Circle({
			radius : this.distance,
			center : this.system.star.position
		});
		return this;
	},
	getDayAngle : function () {
		return (360).degree() / this.period;
	},
	dayMovement : function (part) {
		this.position.rotate(
			this.getDayAngle()*part,
			this.system.star.position,
			true
		);
		return this;
	},
	countPosition : function () {
		var center = this.system.star.position
		return this.setPosition(
			new Point(center)
				.move({
					x : -this.distance,
					y : 0
				})
				.rotate($random(0, 360).degree(), center)
		);
	}

});