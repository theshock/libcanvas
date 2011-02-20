/*
---

name: "Asteroids.Ship"

description: "Asteroids"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Asteroids
	- Asteroids.Fly

provides: Asteroids.Ship

...
*/

Asteroids.Ship = atom.Class({
	Extends : Asteroids.Fly,

	speed      : Asteroids.config.speed.ship,
	friction   : Asteroids.config.speed.shipFriction,
	rotateSpeed: Asteroids.config.speed.shipRotate,
	zIndex: 60,
	radius: 30,

	animation : null,
	rotation  : 0,
	_debug    : {},
	invulnerable : true,
	sprite : 0,
	deaths : 0,
	moving   : false,
	rotating : false,

	initialize: function () {
		// Const
		this.angle    = 0;
		this.velocity = new Point(0, 0);

		this.addEvent('libcanvasSet', function () {
			this.full = this.libcanvas.ctx.getFullRectangle();
			// Setting position
			this.position = this.full.getCenter();

			this.setShape(new Circle({
				center: this.position, radius: this.radius
			}));

			this.invulnerable = false;
		});
	},

	update: function (time) {
		if (!this.isReady()) return;
		
		var key = this.libcanvas.getKey.context(this.libcanvas);

		time = time.toSeconds();

		// Rotation
		if (key('aleft') || key('aright')) {
			this.rotate(this.rotateSpeed * time, key('aleft'));
		}
		// Move
		if (key('aup') || key('adown')) {
			this.velocity.move({
				x : (this.angle).cos() * this.speed * time,
				y : (this.angle).sin() * this.speed * time
			}, key('adown'));
		}
		this.impulse(this.velocity).checkBounds();
		this.velocity.mul(this.friction);
	},

	draw: function () {
		this.parent('yellow');
	},

	explode: function () {
		this.stop();
		this.invulnerable = true;
		this.hidden = true;
		this.libcanvas.addElement(new Asteroids.Explosion(
			this.position.clone(),
			function () {
				this.rotate(-this.angle);
				this.position.moveTo(this.full.getRandomPoint(50));
				this.blink(3000, function () {
					this.invulnerable = false;
					this.hidden       = false;
				});
			}.context(this)
		));
	},

	blink : function (time, fn) {
		var blinker = function (error) {
			blinker.fn && blinker.fn(error);
		};
		blinker.fn = function (error) {
			this.hidden = !this.hidden;
			this.invoker.after(400 - error, blinker);
		}.context(this)

		blinker(0);

		this.invoker.after(time, function () {
			blinker.fn = null;
			fn.call(this);
		}.context(this));

		return this;
	},








	// exit

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
	}
});