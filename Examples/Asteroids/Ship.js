/*
---

name: "Asteroids.Ship"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Asteroids
	- Asteroids.Config
	- Asteroids.FlyingObject

provides: Asteroids.Ship

...
*/

Asteroids.Ship = atom.Class({
	Extends : Asteroids.FlyingObject,

	animation : null,
	rotation  : 0,
	speed     : 0,
	friction  : 0,
	_debug    : {},
	invulnerable : false,
	sprite : 0,
	deaths : 0,
	moving   : false,
	rotating : false,

	initialize : function () {
		// Const
		this.rotation = 0;
		this.speed    = Asteroids.config.speed.ship;
		this.friction = Asteroids.config.speed.shipFriction;
		this.velocity = new LibCanvas.Point(0, 0);

		this.setZIndex(60);


		this._debug = { };

		this.addEvent('libcanvasSet', function () {
			this.libcanvas.addEvent('ready', this.initAnimation.context(this));
			this.full = this.libcanvas.ctx.getFullRectangle();
			// Setting position
			this.position = this.full.getCenter();
				
			this.setShape(
				new LibCanvas.Shapes.Circle({
					center: this.position, radius: 60
				})
			);

			this.startEngineSound();
			this.rotate((180).degree());

			this.invulnerable = true;
			this.blink(2500, function () {
				this.invulnerable = false;
			});
		});
	},

	startEngineSound : function () {
		this.stopEngineSound();
		Asteroids.Audio.get('shipStart').play();
		(function () {
			Asteroids.Audio.get('ship').loop();
		}.delay(1500));
	},
	stopEngineSound : function () {
		Asteroids.Audio.get('ship').stop();
	},

	update : function (time) {
		if (!this.position) return;

		var fire = function (type, start) {
			if (start) {
				this.getFireAnimation(type)
					.stop(1)
					.run('start')
					.run('moving');
			} else {
				this.getFireAnimation(type)
					.stop(1)
					.run('end');
			}
		}.context(this);

		var key = this.libcanvas.getKey.context(this.libcanvas);

		// Rotation
		if (key('left') || key('right')) {
			var newRotating = key('left') ? 'left' : 'right';
			if (this.rotating != newRotating) {
				// changing direction without stopping the ship
				this.rotating && fire(this.rotating, 0);
				fire(newRotating, 1);
			}

			var angle = (5);
			this.rotating = newRotating;
			this.rotate(angle.degree() * (newRotating == 'left' ? -1 : 1));
		} else {
			this.rotating && fire(this.rotating, 0);
			this.rotating = false;
		}
		// Move
		var velocityImpulse = {
			x : -(this.rotation).sin() * this.speed * time,
			y :  (this.rotation).cos() * this.speed * time
		};

		var keyUp = !!key('up');
		if ((keyUp || key('down')) && !this.hidden) {
			var newMoving = key('up') ? 'forward' : 'back';
			if (this.moving != newMoving) {
				// changing direction without stoping the ship
				this.moving && fire(this.moving, 0);
				fire(newMoving, 1);
			}
			this.moving = newMoving;
			this.velocity.move(velocityImpulse, key('up'));
		} else {
			this.moving && fire(this.moving, 0);
			this.moving   = false;
		}
		this.impulse(this.velocity).checkBounds();
		this.velocity.mul(this.friction);
	},

	collide : function (withObj, app) {
		this.stop();
		this.invulnerable = true;
		app.addScore((++this.deaths) * -Asteroids.config.deathPenalty);
		this.stopEngineSound();
		this.libcanvas.addElement(
			new Asteroids.Explosion(this.position, function () {
				this.hidden = true;
			}.context(this), function () {
				(function () {
					this.startEngineSound();
					this.rotate(-this.rotation);
					// Respawn
					this.position.set(new LibCanvas.Point(
						Number.random(50, this.full.width  - 50),
						Number.random(50, this.full.height - 50)
					));
					this.hidden = false;
					this.blink(4500, function () {
						this.invulnerable = false;
					});
				}.delay(300, this));
			}.context(this))
		);
	},

	makeInvulnerable : function (time) {
		this.invulnerable = true;
		(function () {
			this.invulnerable = false;
		}.delay(time, this));
		return this;
	},

	blink : function (time, fn) {
		var blinker = (function () {
			this.hidden = !this.hidden;
		}.periodical(200, this));

		(function () {
			// Stop blinking
			blinker.stop();
			fn.call(this);
			this.hidden = false;
		}.delay(time, this));

		return this;
	},
	initAnimation : function () {
		var img = this.libcanvas.getImage('ship');
		this.animation = new LibCanvas.Animation();
		this.animation.addSprites(img, 120);
		this.animation.add({
			name  : 'main',
			loop  : true,
			line  : Array.range(0,9),
			delay : 50
		}).run('main');
	},
	weaponIndex : true,
	getWeapon : function (index) {
		var wi = (arguments.length) ? index :
			this.weaponIndex = !this.weaponIndex;
		var point = new LibCanvas.Point(this.position)
			.move({
				x : 39 * (wi ? 1 : -1),
				y : -45
			})
			.rotate(this.rotation, this.position);
		point.weaponIndex = wi;
		return point;
	},
	getEnginePosition : function (type) {
		var shift = {}, point = new LibCanvas.Point(this.position);
		switch (type) {
			case 'mainLeft' :
				shift.x = 12;
				shift.y = 60;
				break;
			case 'mainRight' :
				shift.x = -12;
				shift.y =  60;
				break;
			case 'backLeft' :
				shift.x =  21;
				shift.y = -60;
				break;
			case 'backRight' :
				shift.x = -21;
				shift.y = -60;
				break;
			case 'turnLeft' :
				shift.x =  60;
				shift.y =  20;
				break;
			case 'turnRight' :
				shift.x = -60;
				shift.y =  20;
				break;
			default : throw 'Wrong engine type';
		}
		return point.move(shift).rotate(this.rotation, this.position);
	},

	createFireAnimation : function () {
		var image = this.libcanvas.getImage('shipFire');
		return new LibCanvas.Animation()
			.addSprites({
				small : image.sprite(0,   0, 210, 30),
				med1  : image.sprite(0,  30, 210, 30),
				med2  : image.sprite(0,  60, 210, 30),
				med3  : image.sprite(0,  90, 210, 30),
				big1  : image.sprite(0, 120, 210, 30),
				big2  : image.sprite(0, 150, 210, 30),
				big3  : image.sprite(0, 180, 210, 30)
			});
	},

	fireAnimation : {},
	getFireAnimation : function (type) {
		if (!(type in this.fireAnimation)) {
			var size = (type == 'forward') ? 'Big' : 'Small';
			this.fireAnimation[type] = this['createFireAnimation' + size]();
		}
		return this.fireAnimation[type];
	},
	createFireAnimationBig : function () {
		return this.createFireAnimation()
			.add({
				name : 'start',
				frames : [
					{sprite : "small", delay : 50},
					{sprite :  "med1", delay : 25},
					{sprite :  "med2", delay : 25}
				]
			})
			.add({
				name : 'moving',
				loop : true,
				line : ['big1', 'big2', 'big3'],
				delay : 30
			})
			.add({
				name : 'end',
				frames : [
					{sprite :  "med2", delay : 25},
					{sprite :  "med1", delay : 25},
					{sprite : "small", delay : 50}
				]
			});
	},
	createFireAnimationSmall : function () {
		return this.createFireAnimation()
			.add({
				name : 'start',
				frames : [{sprite : "small", delay : 30}]
			})
			.add({
				name : 'moving',
				loop : true,
				line : ['med1', 'med2', 'med3'],
				delay : 30
			})
			.add({
				name : 'end',
				frames : [{sprite : "small", delay : 30}]
			});
	},
	getEnginesImages : function () {
		var forwFire = this.getFireAnimation('forward').getSprite();
		var backFire = this.getFireAnimation('back').getSprite();
		return {
			'mainLeft'  : {
				image  : forwFire,
				degree : (90).degree()
			},
			'mainRight' : {
				image  : forwFire,
				degree : (90).degree()
			},
			'turnLeft' : {
				image  : this.getFireAnimation('left').getSprite(),
				degree : (30).degree()
			},
			'turnRight' : {
				image  : this.getFireAnimation('right').getSprite(),
				degree : (150).degree()
			},
			'backLeft' : {
				image : backFire,
				degree : -(90).degree()
			},
			'backRight' : {
				image : backFire,
				degree : -(90).degree()
			}
		};
	},

	draw : function () {
		if (!this.libcanvas || this.hidden) return;

		var engines = this.getEnginesImages();
		for (var type in engines) {
			if (engines[type].image) {
				this.libcanvas.ctx
					.drawImage({
						image  : engines[type].image,
						center : this.getEnginePosition(type),
						angle  : this.rotation + engines[type].degree
					});
			}
		}

		if (this.animation) {
			this.libcanvas.ctx
				.drawImage({
					image  : this.animation.getSprite(),
					center : this.position,
					angle  : this.rotation
				});
		}
		// this.libcanvas.ctx.stroke(this.shape, 'yellow');
	}
});