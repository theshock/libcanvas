LibCanvas.Scene.Standard
========================

`LibCanvas.Scene.Standard` - основа для построения относительно высокопроизводительных приложений


## Создание

	libcanvasApp.createScene( options );

#### аргумент `options`

* `intersection` (`'auto'|'manual'`) - при перерисовке объекта искать ли объекты, которые он мог затронуть и перерисовывать ли их. 'auto' - перерисовывать, 'manual' - не перерисовывать.

## Свойства

`mouse` - ссылка на личный элемент `LibCanvas.Scene.Mouse`

`resources` - ссылка на соответсвующий регистр ресурсов `LibCanvas.Scene.Resources`

## Метод stop

	LibCanvas.Scene.Standard stop()

Прекращает обновление сцены

#### Пример:
	scene.stop();

#### Возвращает `this`

## Метод start

	LibCanvas.Scene.Standard start()

Возобновляет обновление сцены

#### Пример:
	scene.start();

#### Возвращает `this`

## Метод rmElement

	LibCanvas.Scene.Standard rmElement(LibCanvas.Scene.Element element)

Удалить элемент со сцены

#### Пример:
	var element = new LibCanvas.Scene.Element( scene );

	scene.rmElement( element );

#### Возвращает `this`


# Сдвиг слоя
Сдвиг слоя используется для быстрого перемещения всех элементов слоя относительно всего приложения. В этом случае не происходит перерисовки всех элементов.
На практике рекомендуется использовать `LibCanvas.Scene.Dragger`, если нет необходимости в каких-то специфических правилах сдвига.

## Метод getShift

	LibCanvas.Point getShift()

Получить текущий сдвиг слоя

#### Пример:
	var currentShift = scene.getShift();

## Метод addShift

	LibCanvas.Scene.Standard addShift(LibCanvas.Point point)

Дополительно сдвинуть слой на `point`

#### Возвращает `this`

## Метод addElementsShift
	LibCanvas.Scene.Standard addElementsShift(LibCanvas.Point point)

Свинуть элементы внутри слоя на `point`

#### Возвращает `this`

### Пример
Ниже - пример оптимизированного сдвига слоя, на момент drag'а останавливается отрисовка:

	// В scene.resources.mouse находится общая для приложения мышь
	// В scene.mouse - личная для сцены
	var mouse = scene.resources.mouse;
	var drag  = false;

	// Обрабатываем отпускание кнопки мыши
	var stopDrag = function () {
		// Если drag не начат, то игнорируем
		if (!drag) return;

		// сдвигаем элементы к состоянию сцены только после окончания драга
		scene.addElementsShift();
		// запускаем обработку элементов мышью
		scene.mouse.start();
		// запускаем рендер сцены
		scene.start();
		// отмечаем, что drag закончен
		drag = false;
	};

	mouse.addEvent({
		down: function () {
			// перетаскивание началось
			drag = true;
			// останавливаем обработку элементов мышью
			scene.mouse.stop();
			// останавливаем рендер сцены
			scene.stop();
		},
		// при перемещении мыши по холсту
		move: function (e) {
			// Если drag не начат, то игнорируем
			if (!drag) return;
			// Иначе - смещаем сцену на дельту движения мыши
			scene.addShift( e.deltaOffset );
		},
		// Мы отменяем таскание в случае отпускания кнопки мыши
		up  : stopDrag,
		// или в случае выхода её за пределы приложения
		out : stopDrag,
	});
