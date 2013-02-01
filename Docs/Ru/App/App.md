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
* `simple` - если `true`, то сгенерирует упрощённую вёрстку - из одного холста, но без возможности создавать и сдвигать слои

#### Пример

```js
var app = new App({
	appendTo: '#container',
	size: new Size(800, 500)
})
```

#### Обычная разметка для трёх слоёв:

```html
<div style="width: 1200px; height: 800px;" class="libcanvas-app">
	<div style="overflow: hidden; position: absolute; width: 1200px; height: 800px;">
		<canvas width="1200" height="800" data-name="bg"  style="position: absolute; z-index: 0;"></canvas>
		<canvas width="1200" height="800" data-name="foo" style="position: absolute; z-index: 1;"></canvas>
		<canvas width="1200" height="800" data-name="bar" style="position: absolute; z-index: 2;"></canvas>
	</div>
</div>
```

#### Упрощённая разметка (максимум один слой):

```html
<canvas width="391" height="71" class="libcanvas-app-simple"></canvas>
```

#### Изменение размера приложения:

Изменится только размер приложения, размер каждого из слоёв останется прежним.

```js
app.container.size = new Size( 1500, 1200 );
```


### Методы

#### createLayer

```js
LibCanvas.App.Layer createLayer( object settings )
```

Создаёт и возвращает слой LibCanvas.App

```js
var layer = app.createLayer({ name: 'units' });
```

#### destroy

```js
LibCanvas.App destroy( )
```

Уничтожает приложение

```js
app.destroy();
```

#### zIndexCompare

```js
int zIndexCompare( LibCanvas.App.Element left, LibCanvas.App.Element right )
```

Сравнивает позицию каждого из элементов и возвращает -1, если левый выше, +1 если выше правый и 0, если они на одном уровне
