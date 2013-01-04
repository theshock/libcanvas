Engines.Tile.Engine.Element
===========================

`TileEngine.Element` - это мост для связи `TileEngine` и `LibCanvas.App`.
Необходим для встраивания тайлового движка в `LibCanvas.App` и подписи на события мыши.

### Инициализация

```js
new TileEngine.Element( App.Layer layer, object settings )
```

Settings может содержать следующие параметры:

* `engine` (*TileEngine*) - обязательный параметр, ссылка на тайловый движок
* `from` (*LibCanvas.Point*) - необязательный параметр, смещение отрисовки

```js
var engineElement = new TileEngine.Element(
	app.createLayer('tile-engine'),
	{ engine: engine }
)
```

Не стоит добавлять на слой с тайловым движком ещё какие либо элементы - отрисовка может быть некорректной.

### TileEngine.Element.app

```js
TileEngine.Element.app( App app, TileEngine engine, Point from = null )
```

Используется для более простых приложений - создаёт корректный слой в `LibCanvas.App`, создаёт и добавляет в слой элемент, возвращает этот элемент.
По сути это просто сокращённая запись для создания элемента и слоя для него.

```js
var engineElement = TileEngine.Element.app( app, engine )
```