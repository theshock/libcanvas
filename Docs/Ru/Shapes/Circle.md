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
var circle = new LibCanvas.Shapes.Circle({
   center : [25, 25],
   radius : 15
});
circle.move({ x : 2, y : 3 });
// circle.center == Point(27, 28)
```

#### Возвращает `this`

## Метод intersect

```js
bool intersect(LibCanvas.Shape shape);
```

Проверяет пересечение двух фигур. Точное если `shape` является кругом и через boundingRectangle если `shape` - другая фигура.

#### Пример

```js
var circleA = new Circle(25, 25, 15);
var circleB = new Circle(30, 30, 10);
circleA.intersect( circleB ); // true
```

## Метод scale

```js
Circle scale(number power, LibCanvas.Point pivot);
```

Увеличивает круг в `power` раз относительно точки `pivot` или относительно центра круга

#### Пример

```js
var circle = new Circle(30, 30, 10);

circle.scale( 2 );

// Увеличили круг в два раза:
//
// var circle = new Circle(30, 30, 20);
```

#### Возвращает `this`


## Метод draw

```js
Circle draw(LibCanvas.Context2D ctx, String type);
```

Отрисовывает круг в контекст, используя текущие настройки

#### аргумент `type`
Способ отрисовки. Может принимать значения `fill`, `stroke`, `clear`

#### Пример

```js
var circle = new Circle(100, 100, 20);

var ctx  = canvasElem
	.getContext('2d-libcanvas')
	.set({
		'fillStyle': 'red',
		'strokeStyle': 'black'
	});
// Зальем красным круг в контексте
circle.draw(ctx, 'fill');
// Обведем черным круг в контексте
circle.draw(ctx, 'stroke');
```

Но такой способ рекомендуется использовать только если по какой либо причине не доступен следующий:

```js
var ctx  = canvasElem
	.getContext('2d-libcanvas')
	.fill  (circle, 'red')
	.stroke(circle, 'black');
```

#### Возвращает `this`

## Метод processPath

```js
Circle processPath(LibCanvas.Context2D ctx, bool noWrap = false)
```

Проходит путь с помощью `ctx.arc`

#### аргумент `noWrap`
если указан в false(по умолчанию), то обрамляет с помощью `beginPath`, `endPath`

#### Пример

```js
new Circle(100, 150, 30).processPath(ctx);

// равносильно:

ctx
	.beginPath()
	.arc(100, 150, 30, 0, Math.PI*2, false)
	.closePath();
```

## Метод clone

```js
Circle clone()
```

Возвращает новый круг с таким же радиусом и клонированным центром

#### Пример

```js
var circle = new Circle(100, 150, 30);

var circleClone = circle.clone();
```

## Метод equals

```js
Circle equals( Circle circle )
```

Проверяет, равны ли два круга

#### Пример

```js
var circleA = new Circle(100, 150, 30);
var circleB = new Circle(100, 150, 30);

console.log( circleA == circleB ); // false
console.log( circleA.equals(circleB) ); // true
```