Plugins.Animation
=================

Класс для создания одного случая проигрывания анимации на базе прототипа `Plugins.Animation.Sheet`

### Инициализация

```js
new Animation( object settings )
```

Settings может содержать следующие параметры:

* `sheet` (*Animation.Sheet*) - прототип анимации

```js
animation = new Animation({
	sheet   : this.animationSheet,
	onUpdate: this.redraw,
	onStop  : this.destroy,
});
```

### События

`update` - вызывается когда переключается кадр анимации или при запуске анимации

`stop` - вызывается когда анимация завершается последним кадром или при принудительном завершении методом `stop`

### Методы

#### stop

```js
Animation stop();
```

Остановить анимацию

```js
animation.stop();
```

#### run

```js
Animation run();
```

Запустить анимацию сначала.

```js
animation.run();
```

#### synchronize

```js
Animation synchronize();
```

Синхронизировать старт анимации с другой анимацией.

```js
fooAnimation.synchronize( coreAnimation );
barAnimation.synchronize( coreAnimation );

coreAnimation.run();

// fooAnimation.startTime == barAnimation.startTime == coreAnimation.startTime
```

#### get

```js
Animation get();
```

Получить текущий кадр анимации или `null` если анимация остановлена, закончилась или не запущена.

```js
var frame = animation.get();
```

### Комплексный пример на базе LibCanvas.App

```js

/** @class ExplosionLauncher */
atom.declare( 'ExplosionLauncher', {
	initialize: function (layer, images) {
		this.layer = layer;

		this.animationSheet = new Animation.Sheet({
			frames: new Animation.Frames( images.get('explosion'), 50, 50 ),
			delay : 40
		})
	},

	explode: function (coordinates) {
		new Explosion( this.layer, {
			sheet: this.animationSheet,
			shape: new Circle(coordinates, 50)
		});
	}
});

/** @class Explosion */
atom.declare( 'Explosion', App.Element, {

	configure: function () {
		this.animation = new Animation({
			sheet   : this.settings.get('sheet'),
			onUpdate: this.redraw,
			onStop  : this.destroy,
		});
	},

	renderTo: function (ctx) {
		ctx.drawImage({
			image : this.animation.get(),
			center: this.shape.center
		});
	}

});
```