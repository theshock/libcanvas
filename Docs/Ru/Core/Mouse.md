LibCanvas.Mouse
===============

`LibCanvas.Mouse` предоставляет интерфейс для прозрачного управления мышью

#### Global

После вызова LibCanvas.extract() можно использовать короткий алиас "Mouse"

## Статические свойства

#### метод prevent

Может использовать, чтобы заглушить событие мыши по-умолчанию:

```js
window.onclick = Mouse.prevent;
```

#### метод getOffset

```js
LibCanvas.Point getOffset( MouseEvent e, DOMElement element )
```

Определяет положение мыши относительно элемента

```js
var offset = Mouse.getOffset( event, canvas );
```

#### метод addWheelDelta

```js
MouseEvent addWheelDelta( MouseEvent e )
```

Добавляет кроссбраузерное свойство `delta` в объект события, которое обозначает направление движения колёсика мыши
	
## Создание экземпляра LibCanvas.Mouse

Первым аргументом принимает элемент, события которого надо слушать. 

```js
var mouse = new LibCanvas.Mouse( myCanvas );
```

## Свойства

`point` - `LibCanvas.Point`, с текущими координатами мыши относительно начала элемента

`previous` - `LibCanvas.Point`, предыдущие координаты мыши относительно начала элемента

`delta` - `LibCanvas.Point`, последнее смещение координат мыши

`events` - объект `atom.Events`

## События

* click
* dblclick
* contextmenu
* wheel
* over
* out
* down
* up
* move

#### Пример

```js
mouse.events.add( 'click', function (event, mouse) {
	// нарисует круг радиусом 10 пикселей в точке клика:
	canvas.ctx.fill(
		new Circle( mouse.point, 10 )
	);
});
```

#### Особенности

Событие `wheel` имеет дополнительное свойство `delta`, которого обозначает направление движения колёсика - "-1" или "1".

