LibCanvas
=========

`LibCanvas` - это глобальный объект, который является корнем пространства имён библиотеки. Он содержит несколько статических методов, а также является коротким способом создать сущность `LibCanvas.Canvas2D`:

	var libcanvas = new LibCanvas(element);
	// эквивалентно:
	var libcanvas = new LibCanvas.Canvas2D(element);

При обоих способах создания следующий код правдив:

	libcanvas instanceof LibCanvas; // true
	libcanvas instanceof LibCanvas.Canvas2D; // true

## Статический метод Buffer

	canvasElement LibCanvas.Buffer(int width, int height, bool withCtx)

Создает и возвращает элемент Canvas размером width*height.
Если withCtx правдив, то свойство `ctx` элемента будет равно контексту '2d-libcanvas'


#### Пример
	var buffer = LibCanvas.Buffer(100, 100, true);
	buffer.ctx.fillAll('black');

	libcanvas.ctx.drawImage(buffer, 10, 10);

## Статический метод extract

	object LibCanvas.extract(object to = window)

Позволяет извлечь некоторые классы LibCanvas в глобальное пространство имен (или в локальный объект) для более короткой записи
Извлекает классы Point, Animation а также все классы из пространств Shapes, Behaviors и Utils.

	
#### Пример

	// Стандартный подход:
	var circle = new LibCanvas.Shapes.Circle(100, 100, 20);

	// Извлекаем в локальную переменную
	var LC = LibCanvas.extract({});
	var circle = new LC.Circle(100, 100, 20);
	
	// Извлекаем в глобальное пространство имен:
	LibCanvas.extract();
	var circle = new Circle(100, 100, 20);
	