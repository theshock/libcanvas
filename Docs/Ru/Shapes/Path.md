Path
====

`LibCanvas.Shapes.Path` - используется для создания фигур на базе кривых Безье.

#### Global

После вызова LibCanvas.extract() можно использовать короткий алиас "Path"

## Создание экземпляра LibCanvas.Shapes.Path

```js
var polygon = new LibCanvas.Shapes.Path();
```

#### Пример

```js
var path = new Path();
```

## get length

Возвращает количество шагов в пути:

#### Пример

```js
pathFrom = new Point(150, 200);

path = new Path()
	.moveTo ( pathFrom )
	.curveTo([300, 200], [250, 150])
	.curveTo([200, 280], [290, 250])
	.curveTo( pathFrom , [220, 220]);

console.log( path.length ); // 4
```

## Описание шагов пути

### moveTo

```js
Path moveTo(LibCanvas.Point point);
```

Добавить шаг перемещения к точке `point`

#### Пример

```js
path.moveTo( new Point(100, 150) );
```

### lineTo

```js
Path lineTo(LibCanvas.Point point);
```

Провести линию к точке `point`

#### Пример

```js
path.lineTo( new Point(100, 150) );
```

### curveTo

```js
Path curveTo(LibCanvas.Point point, LibCanvas.Point cp1, LibCanvas.Point cp2 = null);
```

Провести кривую линию к точке `point`

#### Пример

```js
// Квадратическая кривая
path.curveTo( new Point(100, 150), new Point(50, 50) );
// Кубическая кривая
path.curveTo( new Point(100, 150), new Point(50, 50), new Point(80, 40) );
```

## Метод hasPoint

```js
bool hasPoint(LibCanvas.Point point);
```

Возвращает true если точка находится внутри пути

#### Пример

```js
pathFrom = new Point(150, 200);

path = new Path()
	.moveTo ( pathFrom )
	.curveTo([300, 200], [250, 150])
	.curveTo([200, 280], [290, 250])
	.curveTo( pathFrom , [220, 220]);

path.hasPoint( new Point(160, 200) ); // true
path.hasPoint( new Point(666, 200) ); // false
```

## Метод move

```js
Path move(LibCanvas.Point distance, bool reverse);
```

Вызывает метод move у всех точек пути. Если точка повторяется несколько раз - сдвигается лишь однажды

#### Пример

```js
pathFrom = new Point(150, 200);

path = new Path()
	.moveTo ( pathFrom )
	.curveTo([300, 200], [250, 150])
	.curveTo([200, 280], [290, 250])
	.curveTo( pathFrom , [220, 220]);

path.move( new Point(42, 13) );
```

#### Возвращает `this`

## Метод rotate

```js
Path rotate(number angle, LibCanvas.Point pivot);
```
Вращает путь вокруг точки `pivot` на `angle` радиан.

#### Пример

```js
pathFrom = new Point(150, 200);

path = new Path()
	.moveTo ( pathFrom )
	.curveTo([300, 200], [250, 150])
	.curveTo([200, 280], [290, 250])
	.curveTo( pathFrom , [220, 220]);

// вращаем путь вокруг центра
path.rotate( (6).degree(), path.center );
```

#### Возвращает `this`

## Метод scale

```js
Path scale(number power, LibCanvas.Point pivot);
```

Увеличивает путь в `power` раз относительно точки `pivot`

#### Пример

pathFrom = new Point(150, 200);

path = new Path()
	.moveTo ( pathFrom )
	.curveTo([300, 200], [250, 150])
	.curveTo([200, 280], [290, 250])
	.curveTo( pathFrom , [220, 220]);

// Скукожили путь в два раза:
path.scale( 0.5, path.center );
```

#### Возвращает `this`


## Метод draw

```js
Path draw(LibCanvas.Context2D ctx, String type);
```

Отрисовывает путь в контекст, используя текущие настройки

#### аргумент `type`
Способ отрисовки. Может принимать значения `fill`, `stroke`, `clear`

#### Пример

```js
pathFrom = new Point(150, 200);

path = new Path()
	.moveTo ( pathFrom )
	.curveTo([300, 200], [250, 150])
	.curveTo([200, 280], [290, 250])
	.curveTo( pathFrom , [220, 220]);

var ctx  = canvasElem
	.getContext('2d-libcanvas')
	.set({
		'fillStyle': 'red',
		'strokeStyle': 'black'
	});
// Зальем красным многоугольник в контексте
path.draw(ctx, 'fill');
// Обведем черным многоугольник в контексте
path.draw(ctx, 'stroke');
```

Но такой способ рекомендуется использовать только если по какой либо причине не доступен следующий:

```js
var ctx  = canvasElem
	.getContext('2d-libcanvas')
	.fill  (path, 'red')
	.stroke(path, 'black');
```

#### Возвращает `this`

## Метод processPath

```js
Path processPath(LibCanvas.Context2D ctx, bool noWrap = false)
```

Проходит путь с помощью `ctx.moveTo`, `ctx.lineTo`, `ctx.curveTo`

#### аргумент `noWrap`
если указан в false(по умолчанию), то обрамляет с помощью `beginPath`, `endPath`

#### Пример

```js
path = new Path()
	.moveTo ([150, 200])
	.curveTo([300, 200], [250, 150])
	.curveTo([200, 280], [290, 250])
	.curveTo([150, 200], [220, 220])
	.processPath(ctx);

// равносильно:

ctx
	.beginPath()
	.moveTo ([150, 200])
	.curveTo([300, 200], [250, 150])
	.curveTo([200, 280], [290, 250])
	.curveTo([150, 200], [220, 220])
	.closePath();
```

## Метод clone

```js
Path clone()
```

Возвращает новый путь с склонированными точками

#### Пример

```js
path = new Path()
	.moveTo ([150, 200])
	.curveTo([300, 200], [250, 150])
	.curveTo([200, 280], [290, 250])
	.curveTo([150, 200], [220, 220]);

var pathClone = path.clone();
```

Внимание! Если в оригинальном пути несколько точек ссылались на один объект, то в новом пути, клоне, это будут разные, не связанные объекты точек.