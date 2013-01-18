Circle
======
`LibCanvas.Shapes.Circle` - класс, который описывает простую геометрическую фигуру "круг"

#### Global

После вызова LibCanvas.extract() можно использовать короткий алиас "Circle"

## Создание экземпляра LibCanvas.Shapes.Circle

```js
var circle = new LibCanvas.Shapes.Circle( centerX, centerY, radius );

var circle = new LibCanvas.Shapes.Circle( centerPoint, radius );

var circle = new LibCanvas.Shapes.circle({
	center : centerPoint,
	radius : toPoint
});
```

Не забывайте про передачу объектов по ссылке:

```js
var circle = new LibCanvas.Shapes.Circle( point, 10 );
circle.center.x = 100;
alert(point.x); // 100
```

Если необходимо, такого поведения можно избежать, передавая клон точки

```js
var circle = new LibCanvas.Shapes.Circle( center.clone(), radius );
```

## Метод hasPoint

```js
bool hasPoint(LibCanvas.Point point);
```

Возвращает true если точка находится внутри круга

#### Пример

```js
var circle = new LibCanvas.Shapes.Circle({
	center : [25, 25],
	radius : 15
});
circle.hasPoint( new Point(22, 24) ); // true
circle.hasPoint( new Point(88, 88) ); // false
```

## Метод move

```js
LibCanvas.Shapes.Center move(LibCanvas.Point distance, bool reverse);
```

Вызывает метод move у центра

#### Пример

```js
var line = new LibCanvas.Shapes.Line({
	from : [4, 4],
	to   : [8, 8]
});
line.move({ x : 2, y : 3 });
// line.from == Point( 6,  7)
// line.to   == Point(10, 11)
```

#### Возвращает `this`
