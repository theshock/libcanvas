/*
---

name: "Asteroids.Asteroid"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Asteroids
	- Asteroids.Fly

provides: Asteroids.Asteroid

...
*/

Asteroids.Asteroid = atom.Class({
	Extends: Asteroids.Fly,
	radius : 20,
	angle  : 0,
	initialize: function () {
		this.position = new Point(100, 100);
		this.addEvent('libcanvasSet', function () {
			this.libcanvas.addFunc(function (time) {
				this.angle += (36).degree() * (time.toSeconds());
				this.angle = this.angle.normalizeAngle();
			}.context(this));
		});
	},
	draw: function () {
		if (this.center) {
			this.libcanvas.ctx
				.stroke(new Circle(this.position, this.radius), 'red')
				.stroke(new Line  (this.position, this.position.clone().move({
					x: this.radius * 1.5 * this.angle.cos(),
					y: this.radius * 1.5 * this.angle.sin()
				})), 'red');
		}
	}
});