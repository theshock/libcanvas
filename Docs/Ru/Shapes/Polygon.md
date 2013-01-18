Polygon
=======

`LibCanvas.Shapes.Polygon` - описывает многоугольник через множество точек.

#### Global

После вызова LibCanvas.extract() можно использовать короткий алиас "Polygon"

## Создание экземпляра LibCanvas.Shapes.Polygon

```js
var polygon = new LibCanvas.Shapes.Polygon( pointsArray );
```

#### Пример

```js
var polygon = new Polygon([
	[120,  30],
	[200,  10],
	[240, 120],
	[150, 150],
	[100, 100]
]);

var triangle = new Polygon([
	new Point(300, 300),
	new Point(400, 300),
	new Point(320, 390)
]);
```

## get length

Возвращает количество точек многоугольника:

#### Пример

```js
var triangle = new Polygon([
	new Point(300, 300),
	new Point(400, 300),
	new Point(320, 390)
]);

console.log( triangle.length ); // 3
```

## get center

Возвращает центр многоугольника:

#### Пример

```js
var triangle = new Polygon([
	new Point(300, 300),
	new Point(400, 300),
	new Point(320, 390)
]);

console.log( triangle.center ); // Point(340, 330);
```

## Метод get

```js
LibCanvas.Point get(int index);
```

Возвращает точку полигона

#### Пример

```js
var triangle = new Polygon([
	new Point(300, 300),
	new Point(400, 300),
	new Point(320, 390)
]);
triangle.get(2); // Point(300, 400)
```

## Метод hasPoint

```js
bool hasPoint(LibCanvas.Point point);
```

Возвращает true если точка находится внутри полигона

#### Пример

```js
var triangle = new Polygon([
	new Point(300, 300),
	new Point(400, 300),
	new Point(320, 390)
]);
triangle.hasPoint( new Point(305, 305) ); // true
triangle.hasPoint( new Point(188, 212) ); // false
```

## Метод move

```js
Polygon move(LibCanvas.Point distance, bool reverse);
```

Вызывает метод move у всех точек многоугольника

#### Пример

```js
var triangle = new Polygon([
	new Point(300, 300),
	new Point(400, 300),
	new Point(320, 390)
]);
triangle.move( new Point(42, 13) );
```

#### Возвращает `this`

## Метод rotate

```js
Polygon rotate(number angle, LibCanvas.Point pivot);
```

Вращает полигон вокруг точки `pivot` на `angle` радиан.

#### Пример

```js
var triangle = new Polygon([
	new Point(300, 300),
	new Point(400, 300),
	new Point(320, 390)
]);

// вращаем трехугольник вокруг центра
triangle.rotate( (6).degree(), triangle.center );

// вращаем трехугольник вокруг одной из вершин
triangle.rotate( (6).degree(), triangle.get(0) );
```

#### Возвращает `this`

## Метод scale

```js
Polygon scale(number power, LibCanvas.Point pivot);
```

Увеличивает полигон в `power` раз относительно точки `pivot`

#### Пример

```js
var triangle = new Polygon([
	new Point(300, 300),
	new Point(400, 300),
	new Point(320, 390)
]);

triangle.scale( 0.5, triangle.center );

// Скукожили полигон в два раза:
//
// Polygon(
//	   Point(320, 315),
//	   Point(370, 315),
//	   Point(330, 360)
//	);
```

#### Возвращает `this`


## Метод draw

```js
Polygon draw(LibCanvas.Context2D ctx, String type);
```

Отрисовывает многоугольник в контекст, используя текущие настройки

#### аргумент `type`
Способ отрисовки. Может принимать значения `fill`, `stroke`, `clear`

#### Пример

```js
var poly = new Polygon([
	new Point(300, 300),
	new Point(400, 300),
	new Point(320, 390)
]);
var ctx  = canvasElem
	.getContext('2d-libcanvas')
	.set({
		'fillStyle': 'red',
		'strokeStyle': 'black'
	});
// Зальем красным многоугольник в контексте
poly.draw(ctx, 'fill');
// Обведем черным многоугольник в контексте
poly.draw(ctx, 'stroke');
```

Но такой способ рекомендуется использовать только если по какой либо причине не доступен следующий:

```js
var ctx  = canvasElem
	.getContext('2d-libcanvas')
	.fill  (poly, 'red')
	.stroke(poly, 'black');
```

#### Возвращает `this`

## Метод processPath

```js
LibCanvas.Shapes.Polygon processPath(LibCanvas.Context2D ctx, bool noWrap = false)
```

Проходит путь с помощью `ctx.moveTo`, `ctx.lineTo` начиная с первой точки по часовой стрелке

#### аргумент `noWrap`
если указан в false(по умолчанию), то обрамляет с помощью `beginPath`, `endPath`

#### Пример

```js
var poly = new Polygon([
	new Point(300, 300),
	new Point(400, 300),
	new Point(320, 390)
]);
poly.processPath(ctx);

// равносильно:

ctx
	.beginPath()
	.moveTo(new Point(300, 300))
	.lineTo(new Point(400, 300))
	.lineTo(new Point(320, 390))
	.closePath();
```

## Метод invoke

```js
LibCanvas.Shapes.Polygon invoke(string method, mixed args [..])
```

Вызывает у всех точек многоугольника метод `method` с параметрами из остальных аргументов функции

#### Пример

```js
var poly = new Polygon([
	new Point(300, 300),
	new Point(400, 300),
	new Point(320, 390)
]);
// Округляем все координаты
poly.invoke('map', function (value) {
	return Math.round(value);
});
```

#### Возвращает `this`

## Метод clone

```js
LibCanvas.Shapes.Polygon clone()
```

Возвращает новый полигон с склонированными точками

#### Пример

```js
var poly = new Polygon([
	new Point(299.6, 300.3),
	new Point(400.2, 300.4),
	new Point(319.8, 390.1)
]);

var polyClone = poly.clone();
```

## Метод intersect

```js
LibCanvas.Shapes.Polygon intersect(shape)
```

Проверяет, пересекается ли фигура `shape` с текущим полигоном. Полигоны сравнивает через пересечение прямых, остальные фигуры - через пересечение `boundingShape`

#### Пример

```js
var poly1 = new Polygon([
	new Point(300, 300),
	new Point(400, 300),
	new Point(320, 390)
]);
var poly2 = new Polygon([
	new Point(250, 250),
	new Point(350, 300),
	new Point(300, 400)
]);

console.log( poly1.intersect(poly2) ); // true
```
