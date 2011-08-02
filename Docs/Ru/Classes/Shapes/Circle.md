LibCanvas.Shapes.Circle
=======================

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

## Свойства

### radius
Радиус круга

### center
Ссылка на точку - центр круга

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

	LibCanvas.Shapes.Circle move(LibCanvas.Point distance, bool reverse);

Вызывает метод move у центра

#### События
	circle.addEvent('move', function (distance) {
		alert('Круг передвинулся на '
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

## Метод scale

	LibCanvas.Shapes.Circle scale(Number factor, LibCanvas.Point pivot);

Изменяет размер круга в `factor` раз относительно `pivot` или центра, если `pivot` не передан.

	var circle = new Circle( 100, 100, 12 );
	circle.scale( 2 );
	console.log( circle.radius ); // 24;

#### Возвращает `this`

## Метод intersect

	LibCanvas.Shapes.Circle intersect(LibCanvas.Shapes.Circle circle);

Проверяет два круга на предмет пересечения:

	var foo = new Circle( 10, 10, 30 ),
	    bar = new Circle( 20, 20, 30 ),
	    qux = new Circle( 90, 90, 30 );

	console.log( foo.intersect(bar) ); // true
	console.log( foo.intersect(qux) ); // false

## Метод processPath

	LibCanvas.Context2D processPath(LibCanvas.Context2D ctx, bool noWrap = false)

Прокладывает соответствующий путь с помощью `arc`


	new Circle(50, 40, 30).processPath(ctx);
	// равнозначно c:
	ctx
		.beginPath()
		.arc(50, 40, 30, 0, (360).degree(), false )
		.closePath()

	// А также:
	new Circle(50, 40, 30).processPath(ctx, true);
	// равнозначно c:
	ctx.arc(50, 40, 30, 0, (360).degree(), false );

## Метод equals

	bool equals(LibCanvas.Shapes.Circle rect, int accuracy)

Сравнивает центры кругов методом LibCanvas.Point.equals, а также радиусы

	var foo = new LibCanvas.Shapes.Circle(15, 20, 10);
	var bar = new LibCanvas.Shapes.Circle(15, 20, 10);

	trace(bar == foo);      // false
	trace(bar.equals(foo)); // true

## Метод clone
	LibCanvas.Shapes.Circle clone()

Возвращает круг с такими же радиусом и координатами центра

	var circ  = new Circle(30, 20, 10);
	var clone = circ.clone();

	trace(circ == clone);      // false
	trace(circ.equals(clone)); // true
