LibCanvas.Behaviors.Drawable
============================

`LibCanvas.Behaviors.Drawable` отвечает за отрисовку объекта в LibCanvas. Если вы хотите добавлять элементы в список при помощи `libcanvas.addElement()`, то класс должен быть унаследован от `Drawable`

## Global

При использовании LibCanvas.extract() можно использовать короткий алиас «Drawable»

## События

`libcanvasSet` - вызывается сразу после того, как элемент добавляется при помощи libcanvas. За счёт этого в конструкторе можно совершать действия, зависимые от LibCanvas

#### Пример

	atom.Class({
		initialize: function () {
			console.log( this.libcanvas ); // undefined

			this.addEvent( 'libcanvasSet', function () {
				console.log( this.libcanvas ); // LibCanvas
			});
		}
	});

`libcanvasReady` - вызывается, когда libcanvas присвоен и готов к выполнению (например, все картинки закачаны)

#### Пример

	atom.Class({
		initialize: function () {
			console.log( this.libcanvas ); // undefined

			this.addEvent( 'libcanvasReady', function () {
				console.log( this.libcanvas.getImage('test') ); // image
			});
		}
	});

## Абстрактные методы

	void update( Number time )
Вызывается каждый кадр во время этапа просчётов. `time` содержить время, прошедшее с предыдущего кадра

	void draw( Number time )
Вызывается каждый кадр во время этапа рендеринга. `time` содержить время, прошедшее с предыдущего кадра

## Методы startDrawing / stopDrawing

	LibCanvas.Behaviors.Drawable startDrawing( )
	LibCanvas.Behaviors.Drawable  stopDrawing( )

Указывает объекту - начать или прекратить вызовы update и draw каждый кадр.

#### Возвращает `this`

## Метод toLayer

	LibCanvas.Behaviors.Drawable toLayer( name )

Перемещает объект на слой `name`:

	libcanvas.addElement( item );

	item.toLayer( 'bg' );
