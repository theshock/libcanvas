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

new function () {

var speed = Asteroids.config.speed;

Asteroids.Ship = atom.Class({
	Extends : Asteroids.Fly,

	speed      : speed.ship,
	friction   : speed.shipFriction,
	rotateSpeed: speed.shipRotate,
	zIndex: 60,
	radius: 30,
	reload: 0,
	invulnerable: true,
	hidden: true,

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

			this.animation = new Animation()
				.addSprites(this.libcanvas.getImage('ship'), 60)
				.run({
					line : Array.range(0,8),
					delay: 40,
					loop : true
				});

			this.respawn(false);
		});
	},

	  moveAction: null,
	rotateAction: null,

	update: function (time) {
		if (!this.isReady()) return;
		
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

		// Weapon reloading
		this.reload = (this.reload - time).limit(0);

		time = time.toSeconds();
		// Rotation
		if (key('aleft') || key('aright')) {
			this.rotate(this.rotateSpeed * time, key('aleft'));

			var newRotateAction = key('aleft') ? 'left' : 'right';
			if (this.rotateAction != newRotateAction) {
				// changing direction without stopping the ship
				this.rotateAction && fire(this.rotateAction, 0);
				fire(newRotateAction, 1);
			}
			this.rotateAction = newRotateAction;
		} else {
			this.rotateAction && fire(this.rotateAction, 0);
			this.rotateAction = null;
		}

		// Move
		if (key('aup') || key('adown')) {
			this.velocity.move(this.getVelocity().mul(time), key('adown'));

			var newMoveAction = key('aup') ? 'forward' : 'back';
			if (this.moveAction != newMoveAction) {
				// changing direction without stoping the ship
				this.moveAction && fire(this.moveAction, 0);
				fire(newMoveAction, 1);
			}
			this.moveAction = newMoveAction;
		} else {
			this.moveAction && fire(this.moveAction, 0);
			this.moveAction = null;
		}

		this.impulse(this.velocity).checkBounds();
		this.velocity.mul(this.friction);
	},

	draw: function () {
		if (this.hidden) return;

		this.drawEngines();

		this.libcanvas.ctx.drawImage({
			image : this.animation.getSprite(),
			center: this.position,
			angle : this.angle + (90).degree()
		});

		this.parent('red');
	},

	explode: function () {
		this.stop();
		this.invulnerable = true;
		this.hidden = true;
		this.libcanvas.addElement(
			new Asteroids.Explosion(this.position.clone())
				.addEvent('stop', this.respawn.context(this, [true]))
		);
		return this;
	},

	makeInvulnerable: function () {
		this.invulnerable = true;
		this.hidden       = false;
		this.blink(2000, function () {
			this.invulnerable = false;
		});
	},

	respawn: function (random) {
		if (random) this.position.moveTo(this.full.getRandomPoint(50));
		this.blink(2000, function () {
			this.invulnerable = false;
			this.hidden       = false;
		});
	},

	blink: function (time, fn) {
		var blinker = function (error) {
			blinker.fn && blinker.fn(error);
		};
		blinker.fn = function (error) {
			this.hidden = !this.hidden;
			this.invoker.after(250 - error, blinker);
		}.context(this)

		blinker(0);

		this.invoker.after(time, function () {
			blinker.fn = null;
			this.hidden = false;
			fn.call(this);
		}.context(this));

		return this;
	},

	secondWeapon: true,

	getWeaponPosition: function () {
		this.secondWeapon = !this.secondWeapon;

		return this.position
			.clone()
			.move({ x: this.radius, y: 0 })
			.rotate(
				this.angle + (45).degree() * (this.secondWeapon ? -1 : 1),
				this.position
			);
	},

	shoot: function () {
		if (this.invulnerable || this.reload > 0) return null;

		this.libcanvas.getAudio('shot').playNext();

		this.reload = 300;
		return new Asteroids.Bullet(this.getWeaponPosition(), this.angle);
	},


	/********************************
	 * engines fire animation
	 */

	enginesShifts: {
		'mainLeft'  : { x: -30 , y: -6 },
		'mainRight' : { x: -30 , y:  6 },
		'backLeft'  : { x:  30, y:  10 },
		'backRight' : { x:  30, y: -10 },
		'turnLeft'  : { x: -10, y:  30 },
		'turnRight' : { x: -10, y: -30 }
	},
	getEnginePosition : function (type) {
		return this.position.clone()
			.move(this.enginesShifts[type])
			.rotate(this.angle, this.position);
	},
	fireAnimation : {},
	getFireAnimation : function (type) {
		if (!this.fireAnimation[type]) {
			var size = (type == 'forward') ? 'Big' : 'Small';
			this.fireAnimation[type] = this['createFireAnimation' + size]();
		}
		return this.fireAnimation[type];
	},
	createFireAnimation : function () {
		var image = this.libcanvas.getImage('fire');
		return new LibCanvas.Animation()
			.addSprites({
				small : image.sprite(  0, 0, 20, 140),
				med1  : image.sprite( 20, 0, 20, 140),
				med2  : image.sprite( 40, 0, 20, 140),
				med3  : image.sprite( 60, 0, 20, 140),
				big1  : image.sprite( 80, 0, 20, 140),
				big2  : image.sprite(100, 0, 20, 140),
				big3  : image.sprite(120, 0, 20, 140)
			});
	},
	createFireAnimationBig : function () {
		return this.createFireAnimation()
			.add({
				name : 'start',
				line: ['small', 'small', 'med1', 'med2'],
				delay: 40
			})
			.add({
				name : 'moving',
				loop : true,
				line : ['big1', 'big2', 'big3'],
				delay : 40
			})
			.add({
				name : 'end',
				line: ['med2', 'med1', 'small', 'small'],
				delay: 40
			});
	},
	createFireAnimationSmall : function () {
		return this.createFireAnimation()
			.add({
				name : 'start',
				line : ['small'],
				delay: 40
			})
			.add({
				name : 'moving',
				loop : true,
				line : ['med1', 'med2', 'med3'],
				delay : 40
			})
			.add({
				name : 'end',
				line : ['small'],
				delay: 40
			});
	},
	getEnginesImages : function () {
		var get = function (type) {
			return this.getFireAnimation(type).getSprite();
		}.context(this);
		
		return {
			'mainLeft'  : {
				image : get('forward'),
				degree: (270).degree()
			},
			'mainRight' : {
				image : get('forward'),
				degree: (270).degree()
			},
			'turnLeft' : {
				image : get('left'),
				degree: -(150).degree()
			},
			'turnRight' : {
				image : get('right'),
				degree: -(30).degree()
			},
			'backLeft' : {
				image : get('back'),
				degree: (90).degree()
			},
			'backRight' : {
				image : get('back'),
				degree: (90).degree()
			}
		};
	},
	drawEngines: function () {
		var engines = this.getEnginesImages();

		for (var type in engines) if (engines[type].image) {
			this.libcanvas.ctx
				.drawImage({
					image  : engines[type].image,
					center : this.getEnginePosition(type),
					angle  : this.angle + engines[type].degree
				});
		}
	}

});

}