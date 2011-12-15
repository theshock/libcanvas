LibCanvas.App
=============

`LibCanvas.Scene.Standard` - основа для построения относительно высокопроизводительных приложений


## Создание

	libcanvasApp.createScene( options );

#### аргумент `options`

* `intersection` `'auto'|'manual'` - при перерисовке объекта искать ли объекты, которые он мог затронуть и перерисовывать ли их. 'auto' - перерисовывать, 'manual' - не перерисовывать.

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
Ниже - пример оптимизированного сдвига слоя, ради оптимизации на момент drag'а останавливается отрисовка:


	var drag  = null;
	var mouse = scene.resources.mouse;

	// Обрабатываем отпускание кнопки мыши
	var stopDrag = function () {
		if (drag) {
			// сдвигаем элементы только после окончания драга
			scene.addElementsShift(drag);
			// запускаем обработку элементов мышью
			scene.mouse.start();
			// запускаем рендер сцены
			scene.start();
			// отмечаем, что drag закончен
			drag = null;
		}
	};

	mouse.addEvent({
		down: function () {
			// останавливаем обработку элементов мышью
			scene.mouse.stop();
			// останавливаем рендер сцены
			scene.stop();
			// запоминаем, на сколько сдвигулась сцена
			drag = new Point(0, 0);
		}
		// при перемещении мыши по холсту
		move: function (e) {
			// Если drag не начат, то игнорируем
			if (!drag) return;
			// Иначе - смещаем сцену и наш кеш на дельту движения мыши
			drag.move( e.deltaOffset );
			scene.addShift( e.deltaOffset );
		},
		// Мы отменяем таскание в случае отпускания кнопки мыши
		up  : stopDrag,
		// или в случае выхода её за пределы приложения
		out : stopDrag,
	});
