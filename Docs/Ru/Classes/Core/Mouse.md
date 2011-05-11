LibCanvas.Mouse
===============

`LibCanvas.Mouse` предоставляет интерфейс для прозрачного управления мышью, а также абстракцию над тач-евентами, которые приближаются по поведению к поведению мыши

## Свойства

`point` - элемент `LibCanvas.Point`, с текущими координатами мыши

`inCanvas` - находится ли мышь в пределах холста

## Динамические методы

`button` - узнать, нажата ли кнопка мыши в данный момент:

	if (libcanvas.mouse.button()) {
		unit.shoot();
	}

`debug` - выводить на экран текущие координаты мыши

	libcanvas.mouse.debug(); // debug включен

	libcanvas.mouse.debug(false); // debug отключен

## События

Можно подписываться на события. `e.offset` будет соотсветствовать элементу `LibCanvas.Point` с координатами относительно верхнего левого угла холста:

	libcanvas.mouse.addEvent('click', function (e) {
		// выполнить при клике на элемент LibCanvas
		libcanvas.addElement(
			new Foo( e.offset )
		);
	});

Список доступных событий:

* click
* dblclick
* contextmenu
* down
* up
* move
* out
* wheel

При использовании события wheel `e.delta` равно направлению колёсика мыши: 1 для движения вверх и -1 для движения вниз.