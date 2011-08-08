LibCanvas.Shapes.Line
=====================

#### Global

После вызова LibCanvas.extract() можно использовать короткий алиас "Line"

## Создание экземпляра LibCanvas.Shapes.Line

	// две точки LibCanvas.Point - откуда и куда
	var line = new LibCanvas.Shapes.Line( fromPoint, toPoint );

	// объект параметров
	var line = new LibCanvas.Shapes.Line({
		from : fromPoint,
		to   : toPoint
	});

Не забывайте, что точки передаются по ссылке, потому если вы объявили line через две точки то при изменении точки внутри линии будут менятся и оригинальные точки.

	var line = new Line( fromPoint, toPoint );
	line.from.x = 100;
	alert(fromPoint.x); // 100

Если необходимо, такого поведения можно избежать, передавая клоны точек
	var line = new LibCanvas.Shapes.Line( fromPoint.clone(), toPoint.clone() );

Или, что менее предпочтительно, клонируя линию:
	var line = new LibCanvas.Shapes.Line( fromPoint, toPoint ).clone();

## Свойства

### length (get)
Получить длину линии

### center (get)
Создает новую точку с координатами, которые соотвутствуют центру линии

	var line = new Line({
		from : [10, 10],
		to   : [20, 20]
	});
	line.center; // Point(15, 15)


## Метод hasPoint

	bool hasPoint(LibCanvas.Point point);

Возвращает true если точка находится на линии

#### Пример
	var line = new LibCanvas.Shapes.Line({
		from : [4, 4],
		to   : [8, 8]
	});
	line.hasPoint( [6, 6] ); // true
	line.hasPoint( [2, 5] ); // false

## Метод move

	LibCanvas.Shapes.Line move(LibCanvas.Point distance, bool reverse);

Вызывает метод move у обоих точек

#### События
	line.addEvent('move', function (distance) {
		alert('Линия передвинулась на '
			+ distance.x + ' по оси X и на '
			+ distance.y + ' по оси Y'
		);
	});

#### Пример
	var line = new LibCanvas.Shapes.Line({
		from : [4, 4],
		to   : [8, 8]
	});
	line.move({ x : 2, y : 3 });
	// line.from == Point( 6,  7)
	// line.to   == Point(10, 11)

#### Возвращает `this`

## Метод processPath

	LibCanvas.Context2D processPath(LibCanvas.Context2D ctx, bool noWrap = false)

Прокладывает путь с помощью с точки `from` с помощью `ctx.moveTo` в точку `to` с помощью `ctx.lineTo`

#### аргумент `noWrap`
если указан в false(по умолчанию), то обрамляет с помощью beginPath, endPath

#### Пример
	LibCanvas.Shapes.Line({
		from : [4, 4],
		to   : [8, 8]
	}).processPath(ctx);

	// равносильно c:
	ctx.beginPath()
	   .moveTo(4, 4) // line.from
	   .lineTo(8, 8) // line.to
	   .closePath();

#### Возвращает `this`

## Метод perpendicular

	LibCanvas.Point perpendicular(LibCanvas.Point point)

Возвращает перпендикуляр точки `point` на текущую прямую

#### Пример
	var line  = new LibCanvas.Shapes.Line( [0,3], [4,0] );
	var point = new LibCanvas.Point( 0, 0 );

	line.perpendicular( point ); // Point(1.44, 1.92)


## Метод intersect

	bool intersect(LibCanvas.Shapes.Line line)
	LibCanvas.Point intersect(LibCanvas.Shapes.Line line, true)

Определяет пересечение линии с другой линией. Если параметр `point` равен `true`, то вернётся точка пересечения или `null`, если отсутствует - вернётся `true` или `false`.

   var first  = new Line([10, 10], [20, 20]);
   var second = new Line([10, 20], [20, 10]);

   trace( first.intersect(second      ) ); // true
   trace( first.intersect(second, true) ); // Point(15, 15)


## Метод distanceTo

	Number distanceTo(LibCanvas.Point point, boolean asInfinitiveLine)

Определяет расстояние между линией и точкой `point`. Если `asInfinitiveLine=true`, то линия будет считатьтся бесконечной прямой, иначе - отрезком.

	var line  = new Line (10, 10, 20, 20),
	    point = new Point(41, 40);

	line.distanceTo(point      ); // 29
	line.distanceTo(point, true); // 0.7071


## Метод equals
	bool equals(LibCanvas.Shapes.Line line, int accuracy)

Сравнивает точки линий методом LibCanvas.Point.equals

	var foo = new LibCanvas.Shapes.Line(15, 20, 10, 5);
	var bar = new LibCanvas.Shapes.Line(15, 20, 10, 5);

	trace(bar == foo);      // false
	trace(bar.equals(foo)); // true

## Метод clone
	LibCanvas.Shapes.Line clone()

Возвращает линию с такими же координатами

	var line  = new LibCanvas.Shapes.Line(15, 20, 10, 5);
	var clone = line.clone();

	trace(line == clone);      // false
	trace(line.equals(clone)); // true