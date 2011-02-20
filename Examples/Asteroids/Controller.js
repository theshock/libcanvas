/*
---

name: "Asteroids.Controller"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Asteroids
	- Asteroids.Collisions
	- Asteroids.Asteroid
	- Asteroids.Ship
	- Asteroids.Bullet
	- Asteroids.Stones
	- Asteroids.Config
	- Asteroids.Stones

provides: Asteroids.Controller

...
*/


(function () {

var R = Number.random;

Asteroids.Controller = atom.Class({
	Extends : LibCanvas.Behaviors.Drawable,
	Implements : [Asteroids.Collisions],
	player    : 0,
	score     : 0,
	asteroids : [],
	bullets   : [],
	canShoot  : true,
	stopWatch : null,
	lastUpdate : 0,

	initialize : function () {
		this.addEvent('libcanvasSet', this.start);
	},

	createAsteroids : function (number) {
		while (number-- > 0) {
			var asteroid = new Asteroids.Asteroid();
			this.asteroids.push(asteroid);
			this.libcanvas.addElement(asteroid);
		}
		return this;
	},

	start : function () {
		// this.libcanvas.start(this.upd.bind(this));
		this.upd.periodical(20, this);

		this.full      = this.libcanvas.ctx.getFullRectangle();
		this.stopWatch = new LibCanvas.Utils.StopWatch(1);
		this.player    = new Asteroids.Ship();
		this.libcanvas.addElement(this.player);
	},

	upd : function () {
		var time = this.lastUpdate ? (new Date - this.lastUpdate) / 1000 : 0.001;
		this.lastUpdate = new Date;
		// Shooting
		if (this.libcanvas.getKey('space') && this.canShoot && !this.player.hidden) {
			this.handleShoot();
		}

		if (!this.asteroids.length) {
			this.createAsteroids(3);
			this.player.makeInvulnerable(3500);
		}

		this.libcanvas.update();

		// Update all scene objects & check for collisions
		this.player.update(time);
		this.checkCollisions(time);
	},

	addScore : function (delta) {
		this.score += delta;
	},

	handleShoot : function () {
		Asteroids.Audio.get('shot').playNext();
		var bullet = new Asteroids.Bullet(this.player);
		this.bullets.push(bullet);
		this.libcanvas.addElement(bullet);

		// Bullet lifetime
		bullet.die(Asteroids.config.bullets.lifetime, function () {
			this.bullets.erase(bullet);
		}.context(this));

		// Block shooting for appointed time
		this.canShoot = false;
		(function () {
			this.canShoot = true;
		}.delay( Asteroids.config.bullets.penalty, this ));
	},

	getAvgScore : function () {
		return this.score < 0 ? this.score :
			(this.score / ((this.stopWatch.getTime(1) || 1).sqrt()) * 1000).round();
	},

	draw : function () {
		var time = this.stopWatch.getTime();
		var textStyle = atom.clone(Asteroids.config.text);
		this.libcanvas.ctx
			.save()
			.drawImage(this.libcanvas.getImage('stars'))
			.text(atom.extend(textStyle, {
				text  : 'Score     : ' + this.score + '\n' +
				        'Avg score : ' + this.getAvgScore(),
				align : 'left'
			}))
			.text(atom.extend(textStyle, {
				text  : 'Deaths :' + (' '.repeat(time.length-1)) + this.player.deaths + '\nTime : ' + time,
				align : 'right'
			}))
			.restore();
	}
});

})();
