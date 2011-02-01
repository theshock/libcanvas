/*
---

name: "Asteroids.Bullet"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Asteroids
	- Asteroids.Config
	- Asteroids.Asteroid
	- Asteroids.FlyingObject

provides: Asteroids.Bullet

...
*/

Asteroids.Bullet = atom.Class({
	velocity : {},
	position : {},
	weapon   : {},
	rotation : 0,
	player   : null,

	animation : null,
	shotAnimation : null,

	Extends : Asteroids.FlyingObject,

	initialize : function (player) {
		this.setZIndex(200);
		this.player = player;
		this.rotation = player.rotation;
		this.speed = Asteroids.config.speed.bullet;
		this.velocity = new LibCanvas.Point(
			 (this.rotation).sin() * this.speed,
			-(this.rotation).cos() * this.speed
		);
		this.weapon   = player.getWeapon();
		this.position = new LibCanvas.Point(this.weapon);

		this.addEvent('libcanvasReady', function () {
			var shot = this.libcanvas.getImage('shot');
			this.animation = new LibCanvas.Animation()
				.addSprites({
					small  : shot.sprite(0,  0,300,100),
					medium : shot.sprite(0,100,300,100),
					big    : shot.sprite(0,200,300,100)
				})
				.add({
					name : 'start',
					line  : ['small', 'medium'],
					delay : 50
				})
				.add({
					name  : 'moving',
					loop  : true,
					line  : ['big'],
					delay : 50
				})
				.add({
					name  : 'end',
					line  : ['medium', 'small'],
					delay : 100
				});
			this.animation.run('start').run('moving');

					//audio.stop(soundTrack);
			this.shotAnimation = new LibCanvas.Animation()
				.addSprites({
					small  : shot.sprite(0,300,300,100),
					medium : shot.sprite(0,400,300,100),
					big    : shot.sprite(0,500,300,100)
				})
				.add({
					name : 'shot',
					line  : ['small', 'medium', 'big', 'medium', 'small'],
					delay : 20
				})
				.run('shot')
				.addEvent('stop', function () {
					this.shotAnimation = null;
				}.context(this));
		});
	},

	die : function (lifetime, fn) {
		(function () {
			this.velocity.mul(0.4);
			this.animation
				.stop(1)
				.run('end')
				.addEvent('stop', function () {
					fn(this);
					this.libcanvas.rmElement(this);
				}.context(this));
		}.delay(lifetime, this));
	},

	collide : function (obj, app) {
		this.libcanvas.addElement(
			new Asteroids.Explosion(this.position, function () {
				this.libcanvas.rmElement(this);
			}.context(this))
		);

		app.addScore((15 / obj.size).ceil());

		if (obj.size < 3) for (var i = 3; i--;) {
			var smallAsteroid = new Asteroids.Asteroid(obj.size + 1, this.position, obj.color);
			this.libcanvas.addElement(smallAsteroid);
			app.asteroids.push(smallAsteroid);
		}
	},

	impulse : function (pos) {
		this.position.move(pos, false);
		return this;
	},

	update : function (time) {
		// Move
		this.impulse(this.velocity.clone().mul(time)).checkBounds();
	},



	draw : function () {
		if (!this.libcanvas || this.hidden) return;

		this.libcanvas.ctx
			.drawImage({
				image  : this.animation.getSprite(),
				center : this.position,
				angle  : this.rotation + (90).degree()
			});

		if (this.shotAnimation) {
			this.libcanvas.ctx
				.drawImage({
					image  : this.shotAnimation.getSprite(),
					center : this.player.getWeapon(this.weapon.weaponIndex),
					angle  : this.player.rotation + (90).degree()
				});
		}
	}
});