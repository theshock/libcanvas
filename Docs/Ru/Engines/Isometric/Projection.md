Engines.Hex.Isometric
=====================

Библиотека для работы с изометрической проекцией 3d-координат.

#### Global

После вызова LibCanvas.extract() можно использовать короткий алиас "IsometricEngine"

IsometricEngine.Projection
==========================

Предпоставляет лёгкую возможность транслировать координаты из 3d-координат в пространстве в изометрические 2d-координаты и обратно.

#### Координаты

Координаты транслируются очень просто. Положительный сдвиг по оси Х смещает точку вверх-вправо, а положительный сдвиг по оси У - вниз-вправо. Положительный сдвиг по оси Z перемещает точку точно вверх.

![Изометрическая карта](https://raw.github.com/theshock/libcanvas/master/Docs/Ru/Engines/Isometric/iso.png)

#### Размер пикселя

Существуют разные подходы к трансформации пикселей. Правильная изометрическая проекция требует угла в 30 градусов, но часто в компьютерных играх используется более острый угол, чтобы пропорции ячейки были 2:1. За эту величину отвечает настройка "factor":

```js
factor: new Point3D(0.866, 0.5, 0.866) // правильная проекция
factor: new Point3D(    1, 0.5,     1) // пропорциональная проекция
```

Первое значение отвечает за ширину пикселя по Х координате, второе - за ширину пикселя по У координате, третье - за высоту по Z координате.

Вы также можете пропорционально изменять пиксель при помощи настройки `size`

Настройка `start` необходима для указания стартовых координат (где находится пиксель [0;0;0]).

Пример:

```js
var projection = new IsometricEngine.Projection({
	factor: new Point3D(1, 0.5, 1), // карта будет пропорциональной
	size  : 2, // увеличиваем пиксели в два раза
	start : new Point(100, 100) - сетка начинается с лёгким отступом
});
```

### Методы

#### toIsometric

```js
Point toIsometric( Point3D point3d )
```

Транслирует координаты точки из трёхмерных в пространстве в двумерные на экране. Используется, например, при отрисовке.

```js
var playersCoord = [
	new Point3D(100,  50, 10),
	new Point3D( 80,  20,  0),
	new Point3D( 20, 130,  4)
];

playersCoord.forEach(function (coord3d) {
	ctx.fill(new Circle(
		projection.toIsometric(coord3d), 10
	));
});
```

#### to3D

```js
Point3D to3D( Point point3d[, int z = 0] )
```

Транслирует координаты точки из двумерных на экране в трёхмерные в пространстве. Может использоваться для определения координаты поля при клике мышью. Т.к. точно нельзя определить на какой высоте находится текущая точка - можно использовать опциональный аргумент.

```js
mouse.events.add('click', function (e) {
	var mapCoord = projection.to3d( mouse.point );
	
	atom.trace( mapCoord );
});
```

#### Пример

```js
atom.dom(function () {
	function point (x, y, z) {
		return projection.toIsometric(new Point3D( x, y, z ));
	}
	function createColor (x, y) {
		// Цвет будет рассчитываться динамически
		// atom.Color проследит, чтобы мы не вылезли за границы
		// При смещении по оси Х клетка будет краснее
		// При смещении по оси Y клетка будет менее зелёной
		// При увеличении разницы между X и Y клетка будет терять синеву
		// Итог: левая клетка - зелёная, правая - розовая, нижняя - синяя, верхняя - жёлтая
		return new atom.Color( 128 + 24*x, 255 - 24*y, 128-24*(x-y)).toString();
	}
	function drawPoly(x, y) {
		// создаём полигон из 4 соседних точек. Высота в примере всегда равна нулю
		var poly = new Polygon(
			point(x+0,y+0,0),
			point(x+0,y+1,0),
			point(x+1,y+1,0),
			point(x+1,y+0,0)
		);
	
		buffer.ctx
			.fill(poly, createColor(x, y))
			.stroke(poly);
		
		buffer.ctx.fillText( x + '/' + y, poly.center );
	}
	function drawMap (width, height) {
		var x, y;
		for (x = 0; x < width; x++) for (y = 0; y < height; y++) {
			drawPoly(x,y);
		}
	}
	
	var buffer, x, y, projection;
	
	LibCanvas.extract();
	
	// Создаём холст, на котором будем рисовать карту
	buffer = LibCanvas.buffer(800, 480, true);
	// Добавляем его на наш экран
	atom.dom(buffer).appendTo('body');
	// Базовая настройка холста - заливаем фоном и указываем стили 
	buffer.ctx
		.fillAll('#eee')
		.set({
			fillStyle   : 'black',
			strokeStyle : '#777',
			textAlign   : 'center',
			textBaseline: 'middle',
			font: '14px monospace'
		});
	
	// создаём проекцию, размер пикселя будет увеличен в 60 раз
	projection = new IsometricEngine.Projection({
		start: new Point(40, 240),
		size : 60
	});
	// отрисовываем карту размером 7*7 клеток
	drawMap(7, 7);
});
```

![Результат выполнения кода](https://raw.github.com/theshock/libcanvas/master/Docs/Ru/Engines/Isometric/iso-result.png)
