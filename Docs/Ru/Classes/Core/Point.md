LibCanvas.Point
===============

`LibCanvas.Point` - один из базисов в библиотеке LibCanvas. На нем строятся многие вычисления, простые фигуры, отрисовка результата.

#### Гибкость

Когда требуется объект `LibCanvas.Point` достаточно передать point-подобный объект `{ x: x, y: y }` или массив [x, y], если не сказано иначе, но это не рекомендуется.

#### Global

После вызова LibCanvas.extract() можно использовать короткий алиас "Point"

## Создание экземпляра LibCanvas.Point
Создать экземпляр класса `LibCanvas.Point` можно одним из следующих способов:

	var xCoord = 15, yCoord = 20;

	// передав в конструктор координаты
	var point = new LibCanvas.Point( xCoord, yCoord );

	// массив координат
	var point = new LibCanvas.Point([xCoord, yCoord]);

	// объект координат
	var point = new LibCanvas.Point({ x : xCoord, y : yCoord });

	// Другой объект LibCanvas.Point
	var point = new LibCanvas.Point(anotherPoint);
	
	// что равнозначно с
	var point = anotherPoint.clone();

	// после использования LibCanvas.extract():
	var point = new Point( xCoord, yCoord );


## Метод move

	LibCanvas.Point move(LibCanvas.Point distance, boolean reverse = false)

#### Пример
	var point = new LibCanvas.Point(10, 10);
	var distance = { x : 5, y : -3 };
	point.move(distance, false); // x : 15, y :  7
	point.move(distance, true ); // x :  5, y : 13

#### События
	point.addEvent('move', function (distance) {
		console.log('Точка передвинулась на '
			+ distance.x + ' по оси X и на '
			+ distance.y + ' по оси Y'
		);
	});

#### Возвращает `this`


## Метод moveTo

	LibCanvas.Point moveTo(LibCanvas.Point point)

#### Пример
	var start  = new LibCanvas.Point(100, 100);
	var finish = new LibCanvas.Point(800, 800);
	// просто перемещаем точку в конец
	start.moveTo(finish);

#### Возвращает `this`


## Метод angleTo

	int angleTo(LibCanvas.Point point)

#### Пример
	var pO = new LibCanvas.Point(10, 10);
	var pA = new LibCanvas.Point(15, 15);

	var angle = pA.angleTo(pO); // 0.785 (в радианах)
	angle.getDegree() == 45; // в градусах


## Метод distanceTo

	int distanceTo(LibCanvas.Point point)

#### Пример
	var pO = new LibCanvas.Point(10, 10);
	var pA = new LibCanvas.Point(15, 15);

	pA.distanceTo(pO); // 7.071

## Метод diff

	object diff(LibCanvas.Point point)

Этот метод означает примерно следующее :
на сколько надо сдвинуться точке, чтобы она оказалась на месте той, которая передана первым аргументом

#### Пример
	var pO = new LibCanvas.Point(10, 10);
	var pA = new LibCanvas.Point(15, 15);

	pA.diff(pO); // { x : -5, y : -5 }


## Метод rotate

	LibCanvas.Point rotate(int angle, LibCanvas.Point pivot = {x:0, y:0})

Развенуть точку на angle градусов вокруг оси pivot

#### Пример
	var pO = new LibCanvas.Point(10, 10);
	var pA = new LibCanvas.Point(20, 10);

	pA.rotate((90).degree(), pO); // { x : 10, y : 20 }

#### Возвращает `this`

## Метод scale

	LibCanvas.Point scale(int power, LibCanvas.Point pivot = {x:0, y:0})

Увеличивает расстояние от точки `pivot` в `power` раз

#### Пример
	var pO = new LibCanvas.Point(10, 10);
	var pA = new LibCanvas.Point(20, 15);
	pA.scale(2, pO); // { x : 30, y : 20 }


#### Возвращает `this`

## Метод getNeighbour

	LibCanvas.Point scale(string direction)

Возвращает соседнюю с текущей точку.

#### аргумент `direction`
может принимать одно из следующих значений:

`top`,    `t` - возвращает точку сверху

`right`,  `r` - возвращает точку справа

`bottom`, `b` - возвращает точку снизу

`left`,   `l` - возвращает точку слева

`tl` - возвращает точку сверху-слева

`tr` - возвращает точку сверху-справа

`bl` - возвращает точку снизу-слева

`br` - возвращает точку снизу-справа

#### Пример
	var pA = new LibCanvas.Point(15, 15);
	pA.getNeighbour('top'); // { x : 15, y : 14 }
	pA.getNeighbour('bl');  // { x : 14, y : 16 }

## Метод equals

	boolean equals(LibCanvas.Point to, int accuracy)

Метод сравнивает две точки не по ссылкам

#### аргумент `accuracy`
	Если указан, то означает количество знаков, с точностью которых будут сравниватся точки (для неточного сравнения)

#### Пример
	var bar = new LibCanvas.Point(15, 15);
	var foo = new LibCanvas.Point(15, 15);

	trace(bar == foo);      // false
	trace(bar.equals(foo)); // true

#### Пример с accuracy
	var bar = new LibCanvas.Point(12.88888324, 15.1111127);
	var foo = new LibCanvas.Point(12.88888115, 15.1111093);

	console.log(bar == foo);      // false
	console.log(bar.equals(foo)); // false
	console.log(bar.equals(foo, 8)); // false
	console.log(bar.equals(foo, 4)); // true

## Метод toObject

	Object toObject()

Возвращает хеш с координатами точки

#### Пример
	var bar = new LibCanvas.Point(12, 15);
	var foo = bar.toObject();
	// аналогично foo = { x : 12, y : 15 }

## Метод clone

	LibCanvas.Point clone()

Возвращает точку с такими же координатами

#### Пример
	var point = new LibCanvas.Point(15, 15);
	var clone = point.clone();
	console.log(point == clone); // false
	console.log(point.equals(clone)); // true