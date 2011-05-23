Создание своих контекстов
=========================

Вы можете легко создавать свои контексты при помощи LibCanvas.
Достаточно вызвать `HTMLCanvasElement.addContext(name, ContextClass)`, где `ContextClass` - это класс с конструктором, принимающим первым аргументом ссылку на элемент canvas.

#### Пример
	new function () {

		var ContextClass = atom.Class({
			initialize: function (canvas) {
				this.canvas = canvas;
			},
			welcome: function () {
				this.canvas.getContext('2d').fillText('Hello World', 0, 0);
			}
		});

		HTMLCanvasElement.addContext('2d-hello', ContextClass);
	}

#### Использование:
	var mycontext = canvas.getContext('2d-hello');
	mycontext.welcome();
	mycontext.fillRect(0, 0, 10, 10); // Error

Методы стандартного контекст не реализованы, потому `fillRect` вернет ошибку.
Самый простой способ избежать этого - унаследоваться от контекста LibCanvas:

#### Пример
	new function () {

		var ContextClass = atom.Class({
			Extends: LibCanvas.Context2D,
			welcome: function () {
				this.ctx2d.fillText('Hello World', 0, 0);
			}
		});

		HTMLCanvasElement.addContext('2d-libcanvas-hello', ContextClass);
	}

#### Использование:
	var mycontext = canvas.getContext('2d-libcanvas-hello');
	mycontext.welcome();
	mycontext.fillRect(0, 0, 10, 10); // Success

Желательно в названии указывать иерархию контекстовв порядке убывания, через тире.

#### Canvas2DContext
Вы можете использовать `Canvas2DContext` из пакета `Additions` для создания своего контекста на базе нативного (с максимально похожим интерфейсом)

	new function () {

		var ContextClass = atom.Class({
			Extends: LibCanvas.Canvas2DContext,
			welcome: function () {
				this.ctx.fillText('Hello World', 0, 0);
			}
		});

		HTMLCanvasElement.addContext('2d-hello', ContextClass);
	}

#### Использование:
	var mycontext = canvas.getContext('2d-hello');
	mycontext.welcome();
	mycontext.fillRect(0, 0, 10, 10); // Success

### Внимание!
Крайне не рекомендуется переопределять встроенные в браузер контексты (которые всё-равно можно получить через метод `getOriginalContext`), т.к. это принесет в приложение очень неожиданное поведение.
Так же не рекомендуется переопределять контекст `2d-libcanvas`



