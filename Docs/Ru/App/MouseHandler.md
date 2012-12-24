LibCanvas.App.MouseHandler
==========================

`LibCanvas.App.MouseHandler` - класс, который отвечает за взаимосвязь событий LibCanvas.Mouse и объектов LibCanvas.App.Element.

### Инициализация

```js
LibCanvas.App.MouseHandler( object settings );
```

Settings может содержать следующие параметры:

* `app` (*LibCanvas.App*) - приложение, которое необходимо слушать
* `mouse` (*LibCanvas.Mouse*) - объект LibCanvas.Mouse, который будет оповещать об изменениях мыши
* `search` (*LibCanvas.App.ElementsMouseSearch*) - можно указать альтернативный объект, отвечающий за поиск тригернутого элемента, может использоваться для оптимизации

#### Пример

```js
var app, mouse, mouseHandler;

app = new LibCanvas.App({ size: new Size(300,200) });
mouse = new LibCanvas.Mouse(app.container.bounds);
mouseHandler = new LibCanvas.App.MouseHandler({ app: app, mouse: mouse });
```

Поисковик по-умолчанию (LibCanvas.App.ElementsMouseSearch) проверяет элементы на срабатывание вызывая `isTriggerPoint( Point )`

### События

После подписки все элементы получают следующие события:

* click
* dblclick
* contextmenu
* wheel
* mousedown
* mouseup
* mouseout
* mouseover
* mousemove

### Методы

#### stop

```js
LibCanvas.App.MouseHandler stop()
```

Остановить обработку событий мыши

```js
mouseHandler.stop()
```

#### start

```js
LibCanvas.App.MouseHandler start()
```

Возобновить обработку событий мыши

```js
mouseHandler.start()
```

#### subscribe

```js
LibCanvas.App.MouseHandler subscribe(LibCanvas.App.Element element)
```

Подписать элемент на события мыши.

```js
mouseHandler.subscribe( element );

element.events.add( 'click', function (e) {
	console.log( 'element поймал клик мыши', e );
})
```

#### unsubscribe

```js
LibCanvas.App.MouseHandler unsubscribe(LibCanvas.App.Element element)
```

Отписать элемент от событий мыши. Если элемент был удалён с приложения при помощи метода "destroy", то отписка от событий мыши будет активированна автоматически при первом срабатывании события (но не сразу после уничтожения). Скрытые через `hidden: true` элементы всё так же получают события мыши.

```js
mouseHandler.unsubscribe( element );
// Элемент больше не ловит события мыши
```

#### getOverElements

```js
LibCanvas.App.Element[] getOverElements()
```

Получить список элементов, над которыми находится мышь в данный момент (в порядке уменьшения z-index)

```js
var overElements = mouseHandler.getOverElements();
overElements.invoke('destroy');
```

#### fall

```js
LibCanvas.App.MouseHandler fall()
```

Сообщает о необходимости провалиться событию мыши. Важно помнить, что если элемент подписан на события мыши, то он "блокирует" все элементы ниже. То есть при клике на нём события не сработают на элементах под ним даже если они тоже попадают в радиус действия мыши. Если по какой-то причине такое поведение не устраивает (элемент должен ловить события сам, но и не блокировать их для элементов, которые покрывает) можно использовать "проваливание":

```js
mouseHandler.subscribe( element );

element.events.add( 'mousedown', function (e) {
	console.log('Мышь нажата над нашим элементом', e);
	// Но элемент под ним тоже получит это событие
	mouseHandler.fall();
});
```

