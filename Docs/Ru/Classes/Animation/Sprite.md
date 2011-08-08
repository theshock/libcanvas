LibCanvas.Animation.Sprite
==========================

`LibCanvas.Animation.Sprite` позволяет делать анимации (статические картинки - двигающимися), основанные на спрайтах. Идея подобного класса подобна анимациям на базе gif или apng.

## Свойства

`sprite` - текущий спрайт

## События

`changed` - сменился спрайт

`frame:{name}` - сменился спрайт на спрайт с именем `name`

`stop` - анимация остановленна

## Метод addSprites

	[LibCanvas.Animation.Sprite] addSprites(Object sprites)
	[LibCanvas.Animation.Sprite] addSprites(Image|Canvas sprites, Number width)

Позволяет добавить набор спрайтов в анимацию. Можно перечеслить вручную список картинок:

	.addSprites({
		small : image.sprite(  0, 0, 20, 140),
		med1  : image.sprite( 20, 0, 20, 140),
		med2  : image.sprite( 40, 0, 20, 140),
		med3  : image.sprite( 60, 0, 20, 140),
		big1  : image.sprite( 80, 0, 20, 140),
		big2  : image.sprite(100, 0, 20, 140),
		big3  : image.sprite(120, 0, 20, 140)
	})

Другой вариант - это передать широкую картинку, а потом её порежут на спрайты, шириной `width`.

	.addSprites( image, 20 );

#### Возвращает `this`

## Метод add
	[LibCanvas.Animation.Sprite] .add( String name, Array line );
	[LibCanvas.Animation.Sprite] .add( Object { String name, Array line, Boolean loop, Number repeat, Number delay } );
	[LibCanvas.Animation.Sprite] .add( Object { String name, Array frames, Boolean loop, Number repeat } );

Добавляет последовательность в анимацию. У последовательности должно быть имя и список кадров.
Есть короткий способ `line` задавать список кадров - через массив названий. И длинный `frames` - через описание кадров.
`delay` позволяет указывать длительность кадров в миллисекундах.
`loop` указывает, что анимация должна быть зациклена.
`repeat` указывает, что анимацию необходимо повторить несколько раз

	// Короткий:
	animation.add( 'rotating', [1,2,3,4,4,4,3,2,1] );

	// Длинный:
	animation.add({
		name: 'rotating',
		frames: [
			{ sprite: 1, delay:  20 },
			{ sprite: 2, delay:  40 },
			{ sprite: 3, delay:  60 },
			{ sprite: 4, delay: 120, name: 'hit' },
			{ sprite: 3, delay:  60 },
			{ sprite: 2, delay:  40 },
			{ sprite: 1, delay:  20 }
		],
		repeat: 3
	});

#### Возвращает `this`

## Метод run

	[LibCanvas.Animation.Sprite] .run( String name );
	[LibCanvas.Animation.Sprite] .run( Object animation );

Позволяет запускать анимацию с именем `name`, если она была добавлена при помощи add.
Если передан объект или массив, то запустит анимацию, описанную в объекте.

	animation.run( 'rotation' );
	animation.run( [1,2,3,4,4,4,3,2,1] );
	animation.run({
		frames: [
			{ sprite: 1, delay:  20 },
			{ sprite: 2, delay:  40 },
			{ sprite: 3, delay:  60, name: 'hit' },
			{ sprite: 2, delay:  40 },
			{ sprite: 1, delay:  20 }
		],
		repeat: 3
	});

Метод `run` не запускает анимацию мгновенно, а только добавляет её в очередь на выполнение анимаций. Она будет запущена только после того, как все предыдущие анимации будут выполнены. Если одна из предыдущих анимаций имеет свойство `loop: true`, то все следующие анимации не будут запущенны, пока зацикленная анимиация не будет остановлена вручную методом `stop`

#### Возвращает `this`

## Метод stop

	[LibCanvas.Animation.Sprite] stop( Boolean force );

Останавливает выполнение анимации, если `force=false` или всех анимаций, если `force=true`. Позволяет остановить зацикленную анимацию или запустить необходимую анимацию мгновенно.

	animation.run( 'loopedAnimation' );

	stopButton.onClick = function () {
		animation.stop();
	};


# Пример использования

Допустим, у нас есть анимация взрыва. Это 20 кадров 50*50, сбитых в одну картинку размером 1000*50, которые должны запускаться один за другим с одинаковым временем.

	new LibCanvas.Animation.Sprite
		.addSprites( libcanvas.getImage('explosion'), 50 )
		.run( Array.range(0, 19) )
		.addEvent( 'stop', function () {
			// анимация взрыва завершилась
		});

Для более искуссных примеров использования `LibCanvas.Animation.Sprite` смотрите [LibCanvas «Asteroids»](http://libcanvas.github.com/games/asteroids)