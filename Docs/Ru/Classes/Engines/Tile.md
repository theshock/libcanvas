LibCanvas.Engines.Tile
======================

Предоставляет возможность лёгкого создания тайловых карт для игр и приложений

## Конструирование

Самый простой способ использования движка - передать слой с отключеной бек-буферизацией

	var engine = new LibCanvas.Engines.Tile(
		libcanvas.createLayer('tile', { backBuffer: 'off' })
	);

## Свойства

#### width
ширина матрицы

#### height
высота матрицы

## Динамические методы

#### createMatrix(width, height, fill)

создать матрицу, шириной `width`, высотой `height` и заполнить её значением `fill`:

	engine.createMatrix( 5, 4, 'test' );

#### setMatrix(matrix)

присвоить свою двумерную матрицу:

	engine.setMatrix([
		[1,2,1,4],
		[3,2,3,4],
		[0,1,0,1]
	]);

#### addTiles(tiles)

связать название тайла с его значением. Может быть три аргумента - цвет для fillStyle, картинка для drawImage или функция

Функция принимает три аргумента:
* `ctx` - контекст для отрисовки
* `rect` - прямоугольник, в который будет отрисовываться
* `cell` - данные ячейки - объект с значениями `x`, `y` и `t`

	engine.addTiles({
		1: 'red',
		2: libcanvas.getImage('second'),
		3: function (ctx, rect, tile) {
			var color = tile.x % 2 ? 'black' : 'white';
			ctx.stroke( rect, color );
		}
	});

#### setSize(width, height, margin = 0)

установить размер ячейки

	engine.setSize(32, 32, 1);


#### countSize()

посчитать реальный размер поля (сколько всё поле будет занимать в пикселях). Должна быть указана матрица и размер ячейки

	engine
		.createMatrix(4, 3, 'test')
		.setSize(15, 15, 0);

	console.log( engine.countSize() ); // { width: 60, height: 45 }

#### getCell(point)

получить координаты ячейки с координат пикселя:

 	engine.setSize(10, 10, 0);

 	mouse.addEvent('click', function (e) {
 		var cell = engine.getCell( e.offset );
 		// if e.offset == Point(155, 105) :
 		console.log( cell.x, cell.y ); // 15, 10
 	});

#### update()

Сообщить движку, что какое-либо значение в матрице - поменялось

	var matrix = engine.matrix;

	matrix[1][1] = 'changed';

	engine.update();

