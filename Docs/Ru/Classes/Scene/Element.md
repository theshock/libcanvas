LibCanvas.Scene.Element
=======================

`LibCanvas.Scene.Element` - базовый абстрактный класс для всех элементов сцены. На практике от него наследуются рабочие классы, которые занимаются отрисовкой и проверкой пересечений.

## Создание

	new LibCanvas.Scene.Element(scene, options)

#### аргумент `scene`

В качестве первого аргумента принимается сцена `LibCanvas.Scene.Standard`

#### аргумент `options`

* `shape` - возможность быстро установить фигуру элемента, добавится как own property элемента

* `zIndex` - возможность быстро установить zIndex слоя, добавится как own property элемента

Может принимать любые дополнительные элементы, необходимые для вашего класса

## Свойства

`previousBoundingShape` - фигура, в которую элемент отрисовывался предыдущий кадр.

## Переопределяемый метод renderTo

	LibCanvas.Scene.Element renderTo(Context2D ctx, Scene.Resources resources);

Описывает способ отрисовки сущности класса. Базовый метод, обязательный к переопределению.

#### Пример переопределения:

	var MyElement = Class({
		Extends: LibCanvas.Scene.Element,

		renderTo: function (ctx, resources) {
			ctx.drawImage({
				image: this.options.image,
				draw : this.options.shape
			});
			// вызываем родительский метод
			return this.parent(ctx, resources);
		}
	});

#### Должен возвращать `this`

## Переопределяемый метод onUpdate

	LibCanvas.Scene.Element onUpdate(int time);

Вызывается каждый этап просчётов, если сцене не передан `invoke:false`. Может использоваться для, например, обновления состояния элемента в игре. Первый аргумент сообщает, сколько миллисекунд прошло с предыдущего рендера.
В целях оптимизации есть смысл передать сцене `invoke:false`, если метод `onUpdate` не используется, а элементов - много.

#### Пример переопределения:

	var MyElement = Class({
		Extends: LibCanvas.Scene.Element,

		onUpdate: function (time) {
			// мы умножаем вектор движения на время, чтобы скорость игры не зависела от fps
			var shift = this.velocity.clone().mul(time);
			// потом сдвигаем объект
			this.addShift( shift );
			// и вызываем родительский метод
			return this.parent(time);
		}
	});

#### Должен возвращать `this`

## Переопределяемый get-аксессор currentBoundingShape

	LibCanvas.Shape currentBoundingShape

Описывает фигуру, которая является ограничивающей для текущего элемента. Используется при проверке пересечений и очистки предыдущего месторасположения

#### Пример переопределения:

	var MyElement = Class({
		Extends: LibCanvas.Scene.Element,

		/** @property LibCanvas.Shapes.Circle */
		shape: null,

		get currentBoundingShape () {
			return this.shape
				// получаем прямоугольник, являющийся ограничивающим для текущего круга
				.getBoundingRectangle()
				// "прилепляем" его к пикселю, чтобы он не оказался на половине
				.fillToPixel();
		}
	});

## Переопределяемый метод destroy

	LibCanvas.Scene.Element destroy();

Описывает способ уничтожения объекта. По-умолчанию просто удаляется со сцены.

#### Пример переопределения:

	var MyElement = Class({
		Extends: LibCanvas.Scene.Element,

		destroy: function () {
			Cache.clear( this );
			// вызываем родительский метод
			return this.parent(ctx, resources);
		}
	});

## Переопределяемый метод hasPoint

	bool hasPoint( LibCanvas.Point point )

Описывает, находится ли данная точка внутри элемента, по-умолчанию проверяется на нахождение внутри shape-а.

#### Пример переопределения:

	var MyElement = Class({
		Extends: LibCanvas.Scene.Element,

		hasPoint: function (point) {
			// если точка не внутри текущего прямоугольника - однозначно вне элемента
			if (!this.shape.hasPoint(point)) return false;
			// иначе - проверяем пиксель на прозрачность
			return this.getColorByPixel(point).a > 0.2;
		}
	});

## Переопределяемый метод addShift

	LibCanvas.Scene.Element addShift(LibCanvas.Point shift);

Описывает, как необходимо смещать элемент в случае необходимости. По-умолчанию смещает `this.shape` и `this.currentBoundingShape`.
В случае большого количества элементов и частого смещения слоя рекомендуется написать более быструю версию `addShift` без использования `Shape#move`

#### Пример переопределения (функциональность):

	var MyElement = Class({
		Extends: LibCanvas.Scene.Element,

		addShift: function (shift) {
			this.center.move( shift );
			return this.parent( shift );
		}
	});

#### Пример переопределения (оптимизация скорости выполнения):

	var MyElement = Class({
		Extends: LibCanvas.Scene.Element,

		/** @private */
		fastMoveRect: function (rect, shift) {
			rect.from.x += shift.x;
			rect.from.y += shift.y;
			rect.to.x += shift.x;
			rect.to.y += shift.y;
		},

		addShift: function (shift) {
			this.fastMoveRect(this.shape);
			this.fastMoveRect(this.previousBoundingShape);
			return this;
		}
	});

#### Должен возвращать `this`

## Переопределяемый метод redraw

	LibCanvas.Scene.Element redraw();

Сообщаем, что элемент изменился и его необходимо перерисовать в следующий этап рендера. Этап вызовется автоматически в конце кадра, если хотя-бы один элемент запросил отрисовку. Нету смысла стараться избегать лишних вызовов redraw, они не вызывают отрисовку непосредственно, а только сообщают, что она понадобится в следующий кадр.

#### Пример переопределения

	var MyVirtualElement = Class({
		Extends: LibCanvas.Scene.Element,

		redraw: function () {
			// Element is virtual and should not redraw
			return this;
		}
	});

#### Должен возвращать `this`

## Переопределяемый метод clearPrevious

	LibCanvas.Scene.Element clearPrevious(Context2D ctx);

Описывает способ очистки старого месторасположения объекта. По-умолчанию - стирает при помощи `ctx.clear(this.previousBoundingShape)`

#### Пример переопределения

	var MyVirtualElement = Class({
		Extends: LibCanvas.Scene.Element,

		clearPrevious: function (ctx) {
			// мы должны не очищать холст, а заливать его чёрным цветом
			return ctx.fill( this.previousBoundingShape, 'black' );
		}
	});

#### Должен возвращать `this`

Работа с детьми
===============
