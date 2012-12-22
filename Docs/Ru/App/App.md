LibCanvas.App
=============

`LibCanvas.App` - это основа фреймворка для построения интерактивных приложений на LibCanvas.

#### Global

После вызова LibCanvas.extract() можно использовать короткий алиас "App"

### Инициализация

```js
var app = new LibCanvas.App( object settings )
```

Settings может содержать следующие параметры:

* `appendTo` - элемент, в который необходимо добавить приложение. По-умолчанию `body`
* `size` - размеры окна приложения, объект LibCanvas.Size

#### Пример

```js
var app = new App({
	appendTo: '#container',
	size: new Size(800, 500)
})
```

### Методы

#### createLayer

```js
LibCanvas.App.Layer createLayer( object settings )
```

#### Пример

```js
var layer = app.createLayer({ name: 'units' });
```

Создаёт и возвращает слой LibCanvas.App

#### zIndexCompare

```js
int zIndexCompare( LibCanvas.App.Element left, LibCanvas.App.Element right )
```

Сравнивает позицию каждого из элементов и возвращает -1, если левый выше, +1 если выше правый и 0, если они на одном уровне