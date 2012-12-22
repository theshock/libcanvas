LibCanvas.App.Element
=====================

`LibCanvas.App.Element` - абстрактный класс-каркас для создания элементов, которые будут отрисовываться

В отличии от остальных классов LibCanvas этот используется исключительно через наследование.
Наш инструмент - его переопределение и создание собственных методов в классе наследнике:

```js

atom.declare( 'Unit', App.Element, {
	renderTo: function (ctx, resources) {
		ctx.fill( this.shape, 'red' );
	}
});

new Unit( layer, {
	shape: new Circle(100, 100, 50)
});

```

### Методы для переопределения:

#### renderTo

```js
void renderTo( LibCanvas.Context2D ctx, atom.Registry resources )
```

Рендерит елемент в контекст. Описывайте в этом методе только рендер, но не изменения объекта!
По-умочанию вызывает метод `renderTo` у свойства `renderer` если есть или ничего не делает

```js

atom.declare( 'Unit', App.Element, {
	renderTo: function (ctx, resources) {
		ctx.fill( this.shape, 'red' );
		ctx.stroke( this.shape, 'blue' );
	}
});

```

#### configure

```js
void configure()
```

Вызывается сразу после конструирования. Используется в наследниках `App.Element` вместо конструктора

#### get currentBoundingShape

Геттер, который возвращает фигуру, описывающую влияние элемента на контекст. По-умолчанию - прямоугольник, в который вложен `shape` элемента

#### isTriggerPoint

```js
boolean isTriggerPoint( Point point )
```

Определяет, является ли точка точкой срабатывания для мыши или другого устройства ввода. По-умочанию - проверяет на принадлежность `shape`

#### onUpdate

```js
void onUpdate( int time )
```

Если у слоя включён invoke, то вызывается каждый кадр и служит для изменения свойств объекта согласно времени.
В аргументе `time` передаётся время в милисекундах прошедшее с момента последнего кадра для корректировки и отвязки скорости приложения от FPS

```js

atom.declare( 'Unit', App.Element, {
	onUpdate: function (time) {
	   // вращаемся со скоростью 90 градусов в секунду
		this.rotate( (90).degree() * time / 1000 );

		// т.к. изменения происходят каждый кадр - всегда вызываем отрисовка
		this.redraw();
	}
});

```
#### clearPrevious

```js
void clearPrevious( LibCanvas.Context2D ctx )
```

Очищает предыдущее расположение элемента в ctx. По-умолчанию - стирает `this.previousBoundingShape`
