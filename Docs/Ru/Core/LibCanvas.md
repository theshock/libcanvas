LibCanvas
=========

`LibCanvas` - это глобальный объект, который является корнем пространства имён библиотеки. Он содержит несколько статических методов


## Статический метод extract

```js
object LibCanvas.extract(object to = window)
```

Позволяет извлечь некоторые классы LibCanvas в глобальное пространство имен (или в локальный объект) для более короткой записи
	
#### Пример

```js
// Стандартный подход:
var circle = new LibCanvas.Shapes.Circle(100, 100, 20);

// Извлекаем в локальную переменную
var LC = LibCanvas.extract({});
var circle = new LC.Circle(100, 100, 20);

// Извлекаем в глобальное пространство имен:
LibCanvas.extract();
var circle = new Circle(100, 100, 20);
```

## Статический метод buffer

```js
canvasElement LibCanvas.buffer(int width, int height, bool withCtx)
canvasElement LibCanvas.buffer(LibCanvas.Size size, bool withCtx)
```

Создает и возвращает элемент Canvas размером width*height.
Если withCtx правдив, то свойство `ctx` элемента будет равно контексту '2d-libcanvas'


#### Пример

```js
var buffer = LibCanvas.buffer(100, 100, true);
buffer.ctx.fillAll('black');

libcanvas.ctx.drawImage(buffer, 10, 10);
```