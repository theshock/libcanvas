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
