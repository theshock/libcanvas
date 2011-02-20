/*
---

name: "Asteroids.Fly"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Asteroids

provides: Asteroids.Fly

...
*/

Asteroids.Fly = atom.Class({
	Extends : LibCanvas.Behaviors.Drawable,
	Implements: [LibCanvas.Invoker.AutoChoose],

	zIndex   : 10,
	angle    : 0,
	speed    : 0,
	friction : 0,
	shape    : 0,
	hidden   : false,

	update : atom.Class.abstractMethod,

	rotate : function (add, reverse) {
		this.angle = (this.angle + add * (reverse ? -1 : 1)).normalizeAngle();
		return this;
	},

	impulse : function (pos, reverse) {
		this.position.move(pos, reverse);
		return this;
	},

	getVelocity : function () {
		return new Point(
			this.angle.cos() * this.speed,
			this.angle.sin() * this.speed
		);
	},

	checkBounds : function () {
		var cfg = Asteroids.config,
		    pos = this.position,
		    bounds  = cfg.boundsDistance,
		    canvas  = cfg.canvasSize,
			impulse = { x: 0, y: 0 };

		if (pos.x > canvas.width + bounds / 2) {
			impulse.x = -(canvas.width + bounds);
		} else if (pos.x < - bounds / 2) {
			impulse.x =  (canvas.width + bounds);
		}
		if (pos.y > canvas.height + bounds / 2) {
			impulse.y = -(canvas.height + bounds);
		} else if (pos.y < - bounds / 2) {
			impulse.y =  (canvas.height + bounds);
		}
		this.impulse(impulse);
		return this;
	},

	stop : function () {
		this.velocity.set({
			x: 0,
			y: 0
		});
		return this;
	},

	draw : function (color) {
		if (this.hidden) return;

		this.libcanvas.ctx.stroke(this.getShape(), color)
			.stroke(new Line  (this.position, this.position.clone().move({
				x: this.radius * 1.5 * this.angle.cos(),
				y: this.radius * 1.5 * this.angle.sin()
			})), color);
	}
});
