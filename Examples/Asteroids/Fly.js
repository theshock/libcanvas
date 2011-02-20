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

	zIndex   : 10,
	rotation : 0,
	speed    : 0,
	friction : 0,
	position : new Point(0, 0),
	velocity : new Point(0, 0),
	shape    : 0,
	hidden   : false,

	update : atom.Class.abstractMethod,

	rotate : function (add) {
		this.rotation = (this.rotation + add).normalizeAngle();
		return this;
	},

	impulse : function (pos, reverse) {
		this.position.move(pos, reverse);
		return this;
	},

	checkBounds : function () {
		var cfg = Asteroids.config,
		    pos = this.position,
		    bounds  = cfg.boundsDistance,
		    canvas  = cfg.canvasSize,
			impulse = { x: 0, y: 0 };

		if (pos.x > canvas.width + bounds / 2) {
			impulse.x = -(canvas.width + bounds);
		} else if (pos.x < bounds / 2) {
			impulse.x =  (canvas.width + bounds);
		}
		if (pos.y > canvas.height + bounds / 2) {
			impulse.y = -(canvas.height + bounds);
		} else if (pos.y < bounds / 2) {
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
	}
});
