Engines.Tile.Engine
===================

Основа тайлового движка. Отвечает за построение матрицы, хранение методов отрисовки и является фабрикой ячеек.

#### Global

После вызова LibCanvas.extract() можно использовать короткий алиас "TileEngine"

### Инициализация

```js
var engine = new TileEngine( object settings )
```

Settings может содержать следующие параметры:

* `size` (*LibCanvas.Size*) - размеры поля в ячейках
* `cellSize` (*LibCanvas.Size*) - размер ячейки в пикселях
* `cellMargin` (*LibCanvas.Size*) - отступы между ячейками
* `defaultValue` (*mixed*) - значение по-умолчанию для ячейки

```js
engine = new TileEngine({
	// Поле размером 40*25 ячеек
	size: new Size(40, 25),
	// каждая ячейка размером 10*10
	cellSize: new Size(10, 10),
	// отступ между ячейками 1 пиксель
	cellMargin: new Size(1, 1),
	// значение по-умолчанию
	defaultValue: 'unknown'
})
```

### Свойства

`get width` - ширина поля в ячейках
`get height` - высота поля в ячейках
`get requireUpdate` - есть обновившиеся после последнего рефреша ячейки

### Методы

#### setMethod

```js
TileEngine setMethod( string name, Image value )
TileEngine setMethod( string name, function value )
TileEngine setMethod( string name, mixed value )
TileEngine setMethod( object methods )
```

Указывает способ отрисовки для каждого значения ячейки.

Если значение типа Image, то в ячейку с соответствующим значением будет отрисована картинка

Если значение типа function, то будет вызвана функция отрисовки с параметрами `[ctx, cell]`

Если любое другое значение, то будет вызван fill прямоугольника соответствующим значением (паттерн, градиент, строка цвета)

```js
engine.setMethod({
	unknown: 'black',
	grass  : images.get('grass'),
	magic  : function (ctx, cell) {
		var color = (cell.point.x > cell.point.y) ? 'red' : 'blue';

		ctx.fill( cell.rectangle, color );
	}
});
```

#### countSize

```js
Size countSize()
```

Посчитать размеры тайлового поля в пикселях согласно размерам поля, размерам ячейки и отступам

```js
var canvas = LibCanvas.buffer(engine.countSize(), true)
```

#### refresh

```js
TileEngine refresh(Context2D ctx, Point translate = null)
```

Перерисовать изменившиеся с последнего рефреша ячейки.
До первой отрисовки всеячейки считаются изменившимися
При необходимости можно задать смещение отрисоки

```js
engine.refresh(canvas.ctx, new Point(100, 100))
```

#### getCellByIndex

```js
TileEngine.Cell getCellByIndex(Point point)
```

Вернуть ячейку по соответсвующим координатам поля

```js
engine.getCellByIndex(new Point(3, 1))
```

#### getCellByPoint

```js
TileEngine.Cell getCellByPoint(Point point)
```

Вернуть ячейку по соответсвующим координатам в пикселях

```js
engine.getCellByPoint(new Point(743, 351))
```

