Circle
======
`LibCanvas.Shapes.Circle` - класс, который описывает простую геометрическую фигуру "круг"

#### Global

После вызова LibCanvas.extract() можно использовать короткий алиас "Circle"

## Создание экземпляра LibCanvas.Shapes.Circle

	var circle = new LibCanvas.Shapes.Circle( centerX, centerY, radius );

	var circle = new LibCanvas.Shapes.Circle( centerPoint, radius );

	var circle = new LibCanvas.Shapes.circle({
		center : centerPoint,
		radius : toPoint
	});

Не забывайте про передачу объектов по ссылке:

	var circle = new LibCanvas.Shapes.Circle( point, 10 );
	circle.center.x = 100;
	alert(point.x); // 100

Если необходимо, такого поведения можно избежать, передавая клон точки
	var circle = new LibCanvas.Shapes.Circle( center.clone(), radius );

## Метод hasPoint

	bool hasPoint(LibCanvas.Point point);

Возвращает true если точка находится внутри круга

#### Пример
	var circle = new LibCanvas.Shapes.Circle({
		center : [25, 25],
		radius : 15
	});
	circle.hasPoint( [22, 24] ); // true
	circle.hasPoint( [88, 88] ); // false

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

## Метод getCenter
	LibCanvas.Point getCenter();
Создает и возвращает точку, находящуюся ровно в центре линии:

	var line = new LibCanvas.Shapes.Rectangle({
		from : [10, 10],
		to   : [20, 20]
	});
	line.getCenter(); // Point(15, 15)

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
</code></pre></div>

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