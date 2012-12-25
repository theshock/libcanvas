Engines.Hex.Projection
=====================

Предоставляет лёгкую возможность трансформировать rgb-hex координаты в 2-d координаты и обратно.
Обратите внимание, rgb-координаты для представления hex-сетки - мощное, однозначное и быстрое решение.
Сперва оно может показаться менее привычным, чем обычные x-y координаты, но после работы всё поменяется.

#### Координаты

При перемещении по карте координаты изменяются так:

* `g+1, b-1` - вверх
* `g-1, b+1` - вниз
* `r-1, g+1` - влево-вверх
* `r-1, b+1` - влево-вниз
* `r+1, b-1` - вправо-вверх
* `r+1, g-1` - вправо-вниз

Основное правило - сумма трёх координат должна быть равна нулю, т.е.:

```js
r + g + b = 0
```

![Пример сетки координат](https://raw.github.com/theshock/libcanvas/master/Docs/Ru/Engines/Hex/hex-coords.png)

#### Размер ячейки

Размер каждого гекса задаётся тремя параметрами:

* `baseLength ` - ширина основной стороны
* `hexHeight  ` - высота гекса
* `chordLength` - ширина бокового трехугольника

![Размеры гекса](https://raw.github.com/theshock/libcanvas/master/Docs/Ru/Engines/Hex/hex-sizes.png)

При необходимости  получить равносторонний гекс с длиной стороны K мы получаем следующие значения:

```js
baseLength  = K
chordLength = K * sin(30)     = K / 2
hexHeight   = K * cos(30) * 2 = K * 1.732
```

Например:

```js
baseLength  = 56
chordLength = 28
hexHeight   = 97
```

#### Global

После вызова LibCanvas.extract() можно использовать короткий алиас "HexEngine.Projection"

### Инициализация

```js
var projection = new HexEngine.Projection( object settings )
```

Settings может содержать следующие параметры:

* Размеры гекса (описаны выше):
	* `baseLength`
	* `chordLength`
	* `hexHeight`
* `start` - точку, которую необходимо считать за центр гекса [0:0:0]

Если `chordLength==null` или `hexHeight==null`, то они вычисляются из `baseLength` для создания равностороннего многоугольника.

### Методы

#### isZero

```js
bool isZero( int[] coordinates )
```

Проверяет, являются ли координаты координатами центрального гекса ([0,0,0])

```js
projection.isZero([ 0, 0, 0]); // true
projection.isZero([-1,-1, 2]); // false
```

#### rgbToPoint

```js
Point rgbToPoint( int[] coordinates )
```

Возвращает центр гекса из массива его rgb-координат. Может использоваться, например, чтобы разместить юнит по центру гекса на холсте

```js
var center = projection.rgbToPoint([ 0, 0,  0]);
var center = projection.rgbToPoint([ 5, 2, -7]);
```


#### pointToRgb

```js
int[] rgbToPoint( Point point )
```

Возвращает rgb-координаты гекса согласно точки `point`. Точка может находится в любом месте гекса, не обязательно в центре. Может использоватся, например, чтобы узнать над каким гексом находится мышь:

```js
var coordArray = projection.pointToRgb( new Point(100, 50) );

// Отслеживаем, над каким гексом находится мышь:
var trace = atom.trace();

mouse.events.add( 'move', function () {
	trace.value = projection.pointToRgb( mouse.point );
});
```

#### createPolygon

```js
Polygon createPolygon( Point center )
```

Возвращает полигон из шести точек, который описывает гекс. Может использоваться для векторной отрисовки гекса на холст:

```js
var centerPoint = projection.rgbToPoint([ 1, -1, 0]);
var polygon = projection.createPolygon( centerPolygon );

ctx.fill  ( polygon, 'white' );
ctx.stroke( polygon, 'black' );
```

#### sizes

```js
HexEngine.Projection.Sizes sizes( Number padding = 0 );
```

Возвращает объект `HexEngine.Projection.Sizes`

```js
var sizes = projection.sizes();
```

HexEngine.Projection.Sizes
===========================

Объект, который предназначен для определения размеров гексагональной карты согласно её параметрам и координатам гексов. Важно, что карта может быть несимметрична. Создаётся только при помощи метода `HexProjection.Sizes#sizes`.

```js
var sizes = projection.sizes();
```

#### add

```js
HexEngine.Projection.Sizes add( int[] coordinates )
```

Добавляет координаты в карту

```js
sizes
	.add([  0,  0,  0 ])
	.add([  1, -1,  0 ])
	.add([  1,  0, -1 ])
	.add([ -1,  1,  0 ])
	.add([ -1,  0,  1 ])
	.add([  0,  1, -1 ])
	.add([  0, -1,  1 ])
	.add([  0, -2,  2 ])
```

#### size

```js
Size size()
```

Возвращает размер холста, необходимый, чтобы вместить карту включая отступы `padding`.

```js
var size = sizes.size();
```

#### center

```js
Point center()
```

Возвращает такое расположение нулевого гекса, при котором карта идеально впишется в размеры, которые возвращает метод `size`

```js
var center = sizes.center();
```
	
Совместное использование
========================

Что делать, если нам надо создать холст минимального размера, но при этом, чтобы в него точно вместилась гексагональная карта? Это очень просто:

```js
// У нас есть список гексов, которые необходимо отрисовать:
var hexes = [
	[  0,  0,  0 ],
	[  1, -1,  0 ],
	[  1,  0, -1 ],
	[ -1,  1,  0 ],
	[ -1,  0,  1 ],
	[  0,  1, -1 ],
	[  0, -1,  1 ],
	[  0, -2,  2 ],
	[  1, -2,  1 ],
	[  2, -2,  0 ]
];

// создаём проекцию необходимого размера, центр не указываем
var projection = new HexEngine.Projection({
	baseLength : 40,
	chordLength: 20,
	hexHeight  : 50
});

// Создаём объект sizes и добавляем в него все гексы:
// Отступ от границ карты будет равен 8
var sizes = projection.sizes(8);
hexes.forEach(function (coord) {
	sizes.add(coord);
});

// Теперь мы можем установить координаты нулевого гекса:
projection.settings.set({ start: sizes.center() });

// Создаём буффер необходимого размера, на который и отрисуем наши гексы:
var buffer = LibCanvas.buffer( sizes.size(), true );

// Отрисовываем гексы:
hexes.forEach(function (coord) {
	var poly = projection.createPolygon(
		projection.rgbToPoint(coord)
	);
	
	// Мы хотим видеть, какой именно гекс является центральным
	var fillColor = projection.isZero(coord)
		? 'white'
		: ['red', 'green', 'blue'].random
	
	buffer.ctx.fill  ( poly, fillColor );
	buffer.ctx.stroke( poly, 'white' );
});

// отображаем буффер:
atom.dom( buffer ).appendTo( 'body' );
```
