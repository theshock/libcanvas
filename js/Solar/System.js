Solar.System = new Class({
	Extends : LC.Interfaces.Drawable,

	star : null,
	planets : {},

	trajBuffer : null,

	draw : function () {
		if (!this.trajBuffer) {
			this.trajBuffer = this.canvas.createBuffer(1050, 1050);
			var ctx = this.trajBuffer.getContext('2d-libcanvas');
			for (var i in this.planets) {
				ctx.stroke(
					this.planets[i].trajectory,
					this.planets[i].trajectoryColor
				);
			}
		}
		this.canvas.ctx.drawImage(this.trajBuffer, 0, 0);
	},

	createStar : function (params, position) {
		this.canvas.addElement(
			this.star = new Solar.Object(this, params)
				.setPosition(position)
				.setZIndex(5)
		);
		return this;
	},
	createPlanet : function (name, params) {
		this.planets[name] = new Solar.Planet(this, params)
			.countPosition()
			.setZIndex(5);
		this.canvas.addElement(this.planets[name]);
		this.planets[name].name = name;
		return this;
	},
	createPlanets : function (planets) {
		for (var i in planets) this.createPlanet(i, planets[i]);
		return this;
	},
	twist : function () {
		var daysInSec = 10;
		(function (){ // 1-2ms
			for (var i in this.planets) {
				this.planets[i].dayMovement(1/50 * daysInSec);
			}
			this.canvas.update();
		}.bind(this).periodical(20));
	}
});