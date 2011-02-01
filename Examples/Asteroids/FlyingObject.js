/*
---

name: "Asteroids.FlyingObject"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Asteroids
	- Asteroids.Config

provides: Asteroids.FlyingObject

...
*/

Asteroids.FlyingObject = atom.Class({
	Extends : LibCanvas.Behaviors.Drawable,

	zIndex   : 10,
	rotation : 0,
	speed    : 0,
	friction : 0,
	position : new LibCanvas.Point(0, 0),
	velocity : new LibCanvas.Point(0, 0),
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
		var bD = Asteroids.config.boundsDistance;
		var cS = Asteroids.config.canvas.size;
		[
			[ this.position.x > cS[0] + bD/2, -cS[0] - bD, 'x'],
			[ this.position.x <        -bD/2,  cS[0] + bD, 'x'],
			[ this.position.y > cS[1] + bD/2, -cS[1] - bD, 'y'],
			[ this.position.y <        -bD/2,  cS[1] + bD, 'y']
		].forEach(function (item) {
			item[0] && this.impulse({
				x: item[2] == 'x' ? item[1] : 0,
				y: item[2] == 'y' ? item[1] : 0
			});
		}.context(this));
	},

	draw : function () {
		if (!this.libcanvas || this.hidden) return;
		
		this.libcanvas.ctx
			.save()
			.set('lineWidth', 2)
			.stroke(this.shape, '#FFF')
			.restore();
	},

	stop : function () {
		this.velocity.x = 0;
		this.velocity.y = 0;
		return this;
	}
});
