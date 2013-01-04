Engines.Tile.Engine.Mouse
=========================

`TileEngine.Mouse` - специальный обработчик для оптимизированной обработки мыши при помощи делегации вместо подписывания каждой ячейки на свои события.

### Инициализация

```js
new TileEngine.Mouse( TileEngine.Element element, LibCanvas.Mouse mouse )
```

Важно помнить, что `element` должен быть предварительно подписан на события мыши при помощи объекта `App.MouseHandler`

### События

* `over` - мышь наведена на ячейку
* `out` - мышь убрана с ячейки
* `down` - мышь нажата на ячейку
* `up` - мышь отжата на ячейке
* `click` - `down` и `up` сработали на одной ячейке
* `contextmenu` - контекстное меню вызвано над ячейкой

Во всех событиях первым аргументом передаётся ячейка, которая вызвала событие.


#### Полный пример

```js
element = TileEngine.Element.app( app, engine );

mouse = new Mouse(app.container.bounds);

new App.MouseHandler({ mouse: mouse, app: app })
	.subscribe( element );

new TileEngine.Mouse( element, mouse ).events.add({
	over: function (cell) {
		console.log( 'mouse over ', cell );
	},
	out: function (cell) {
		console.log( 'mouse out of ', cell );
	},
	click: function (cell) {
		console.log( 'mouse click at ', cell );
	}
});
```