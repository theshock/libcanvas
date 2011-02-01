/*
---

name: "Asteroids.Collisions"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- Asteroids
	
authors:
	- "Shock <shocksilien@gmail.com>"

provides: Asteroids.Collisions

...
*/

Asteroids.Collisions = atom.Class({
	checkCollisions : function (time) {
		this.checkAsteroids(time).checkBullets(time);
	},

	checkAsteroids : function (time) {
		this.asteroids.forEach(function (asteroid) {
			asteroid.update(time);

			if (this.player.invulnerable) return;

			if (asteroid.shape.intersect(this.player.shape)) {
				// Ship explosion
				this.player.collide(asteroid, this);
			}
		}.context(this));
		return this;
	},

	checkBullets : function (time) {
		this.bullets.forEach(function (bullet) {
			bullet.update(time);

			var destroyed = [];

			// Collision with asteroids
			this.asteroids.forEach(function (asteroid) {
				if (asteroid.shape.hasPoint(bullet.position)) {
					destroyed.push(asteroid);
				}
			}.context(this));

			if (destroyed.length) {
				this.libcanvas.rmElement(bullet);
				this.bullets.erase(bullet);

				destroyed.forEach(function (asteroid) {
					bullet.collide(asteroid, this);

					this.libcanvas.rmElement(asteroid);
					this.asteroids.erase(asteroid);
				}.context(this));
			}
		}.context(this));
		return this;
	}
});