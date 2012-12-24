LibCanvas.App.Light
===================

`LibCanvas.App.Light` - надстройка над `LibCanvas.App` для более лёгкого и доступного интерфейса

### Инициализация

```js
var helper = new LibCanvas.App.Light( LibCanvas.Size size, object settings )
```

`size` - размер приложения

Settings может содержать следующие параметры:

* `mouse` - будет ли использоваться мышь (по-умолчанию `true`)
* `appendTo` - в какой элемент необходимо прикрепить приложение (по-умолчанию `body`)

#### Пример

```js
var helper = new LibCanvas.App.Light( new Size(800, 500) )
```

### Методы

#### createVector

```js
App.Light.Vector createVector( LibCanvas.Shape shape, object settings )
```

Создаёт, добавляет в приложение и возвращает элемент App.Light.Vector, который служит для отрисовки геометрических фигур в приложении

```js
var vector = helper.createVector( new Circle(100, 100, 20) );
```

#### createText

```js
App.Light.Text createText( LibCanvas.Shape shape, object style, object settings )
```

Создаёт, добавляет в приложение и возвращает элемент App.Light.Text, который служит для отрисовки текста в приложении
Содержимое `style` согласно интерфейса метода [Context2D.text](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Core/Context2D.md#%D0%9C%D0%B5%D1%82%D0%BE%D0%B4-text)

```js
var text = helper.createText(
	new Rectangle(0, 0, 100, 40),
	{
		text: 'Hello, World!',
		bold: true
	}
);
```

#### createImage

```js
App.Light.Image createImage( LibCanvas.Shape shape, Image image, object settings )
```

Создаёт, добавляет в приложение и возвращает элемент App.Light.Image, который служит для отрисовки картинок в приложении

```js

atom.ImagePreloader.run({ logo: 'html5-logo.png' },
	function (images) {
		var element = helper.createImage(
			new Rectangle(64, 64, 256, 256),
			images.get('logo')
		);
	});
```