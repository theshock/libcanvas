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

	LibCanvas.Shapes.Center move(LibCanvas.Point distance, bool reverse);

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
