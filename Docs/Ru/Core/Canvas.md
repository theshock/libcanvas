Создание своих контекстов
=========================

Улучшение прототипа HTMLCanvasElement позволяет легко создавать свои контексты при помощи LibCanvas.
Достаточно вызвать `HTMLCanvasElement.addContext(name, ContextClass)`, где `ContextClass` - это класс с конструктором, принимающим первым аргументом ссылку на элемент canvas.

#### Пример

```js
new function () {

	var ContextClass = atom.declare({
		initialize: function (canvas) {
			this.canvas = canvas;
			this.ctx2d  = canvas.getContext('2d');
		},
		welcome: function () {
			this.ctx2d.fillText('Hello World', 0, 0);
		}
	});

	HTMLCanvasElement.addContext('2d-hello', ContextClass);
}
```

#### Использование:

```js
var myContext = canvas.getContext('2d-hello');
myContext.welcome();
myContext.fillRect(0, 0, 10, 10); // Error
```

Методы стандартного контекста не реализованы, потому `fillRect` вернет ошибку.
Самый простой способ избежать этого - унаследоваться от контекста LibCanvas.
Обратите внимание - конструктор мы унаследовали от родительского `LibCanvas.Context2D`, потому достаточно реализовать методы.

#### Пример

```js
new function () {
	var HelloContextClass = atom.declare( LibCanvas.Context2D, {
		welcome: function () {
			return this.ctx2d.fillText('Hello World', 0, 0);
		}
	});

	HTMLCanvasElement.addContext('2d-libcanvas-hello', HelloContextClass);
}
```

#### Использование:

```js
var myContext = canvas.getContext('2d-libcanvas-hello');
myContext.welcome();
myContext.fillRect(0, 0, 10, 10); // Success
```

Желательно в названии указывать иерархию контекстовв порядке убывания, через тире.

#### Canvas2DContext
Вы можете использовать плагин `Canvas2DContext` для создания своего контекста на базе нативного (с максимально похожим интерфейсом)

```js
new function () {

	var HelloContextClass = atom.declare( LibCanvas.Canvas2DContext, {
		welcome: function () {
			return this.ctx2d.fillText('Hello World', 0, 0);
		}
	});

	HTMLCanvasElement.addContext('2d-hello', HelloContextClass);

}
```

#### Использование:

```js
var myContext = canvas.getContext('2d-hello');
myContext.welcome();
myContext.fillRect(0, 0, 10, 10); // Success
```

### Внимание!
Крайне не рекомендуется переопределять встроенные в браузер контексты (которые всё-равно можно получить через метод `getOriginalContext`), т.к. это принесет в приложение очень неожиданное поведение.
Так же не рекомендуется переопределять контекст `2d-libcanvas`



