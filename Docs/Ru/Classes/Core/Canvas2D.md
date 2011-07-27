LibCanvas.Canvas2D
==================

`LibCanvas.Canvas2D` - это ключевой объект, вокруг которого строится вся отрисовка, организована работа со слоями, событиями и устройствами

## Создание

	new LibCanvas(element, options)

#### аргумент `element`
	
В качестве первого аргумента принимается указатель на html-элемент. Это может быть css-селектор, dom-объект, или объект atom.

#### аргумент `options`


* `clear` (*bool|string*) Означает, очищать ли перед каждым кадром холст. ВОзможные значения:
* * `false` - не очищать
* * `true` (по-умолчанию) - очищать
* * (*string*) - залить указанным стилем

* `invoke` `true|false` - вызывать ли метод `update` у всех переданных элементов (по умолчанию - false, далее будет true, потому желательно указывать)

* `fps` - максимальный fps, к которому необходимо стремиться. LibCanvas не будет превышать это значение, но если браузер будет не справляться, то библиотека будет динамически подстраиваться под компьютер, чтобы не было зависаний и пропусков кадров.

* `preloadImages` - хеш картинок, которые необходимо предзагрузить и которые будут доступны через метод getImage

* `preloadAudio` - хеш звуковых файлов, которые необходимы для работы приложения (на данный момент они не связаны с событием `ready`). Звёздочка заменяется на `ogg` или `mp3`, зависимо от того, что поддерживает браузер. Звуки будут доступны через метод `getAudio()`

#### Пример:

	var libcanvas = new LibCanvas('#my-canvas', {
		fps: 24,
		clear: '#333',
		invoke: true,
		preloadImages: {
			'first' : '/images/first.png',
			'second': '/images/second.png'
		},
		preloadAudio: {
			'shot' : '/sounds/shot.*'
		}
	});

## Разметка

Достаточно создать один тег и передать ссылку на него в LibCanvas:

	<body>
		<canvas id="my-first-canvas"></canvas>
	</body>
	<script>
		new LibCanvas('#my-first-canvas');
	</script>

В итоге ваша вёрстка будет приведена приблизительно к такому виду:

	<body>
		<div class="libcanvas-layers-container">
			<!-- Главный слой - элемент, который вы создаёте на странице -->
			<canvas data-layer-name="main" id="my-first-canvas"></canvas>
			<!-- Список слоёв, которые вы будете создавать при помощи javascript -->
			<canvas data-layer-name="your-layer-name-first"></canvas>
			<canvas data-layer-name="your-layer-name-second"></canvas>
		</div>
	</body>

## Свойства

`ctx` - ссылка на активный контекст, следует использовать при отрисовке. Например:

	libcanvas.ctx.fillAll('green');

`mouse` - ссылка на объект `LibCanvas.Mouse`. Активируется после использования метода `listenMouse()`

`keyboard` - ссылка на объект `LibCanvas.Keyboard`. Активируется после использования метода `listenKeyboard()`

`zIndex` - zIndex слоя. При указании "null" - поднимется в самый верх.

## События

`ready` - вызывается, когда все изображения загружены и libcanvas готов к отрисовке.

`frameRenderStarted` - вызывается каждый кадр перед началом просчётов

`frameRenderFinished` - вызывается каждый кадр после окончания просчётов и рендера

## Метод show

	LibCanvas.Canvas2D show();

Отображает текущий слой, если он скрыт

#### Пример:

	libcanvas.show()

#### Возвращает `this`

## Метод hide

	LibCanvas.Canvas2D hide();

Скрывает текущий слой, если он не скрыт

#### Пример:

	libcanvas.hide()

#### Возвращает `this`

## Метод size

	LibCanvas.Canvas2D size(object size, bool wrapper = false);

Позволяет указать размер слоя и контейнера

#### аргументы
`size` - объект с параметрами `width` и `height`

`wrapper` - (bool) - указывает, нужно ли менять значение элемента или только слоя

#### Пример:

	// Меняем размер текущего слоя:
	libcanvas.size({
		width : 400,
		height: 250
	});

	libcanvas.size(400, 250);

	// Меняем размер элемента:
	libcanvas.size({
		width : 400,
		height: 250
	}, true);

#### Возвращает `this`

## Метод shift

	LibCanvas.Canvas2D shift(Number top, Number left);

Устанавливает сдвиг слоя относительно верхнего-левого угла контейнера LibCanvas. Предыдущий сдвиг в расчёт не берется


#### Пример:

	// Смещаем слой на 400 пикселей вправо и на 250 вниз
	libcanvas.shift(400, 250);

#### Возвращает `this`

## Метод update

Указывает на то, что картинка изменена и необходимо перерендерить изображение.
Внимание! Кадр не будет рендерится до вызова update. Это сделано в целях оптимизации - чтобы холст не перерисовывался, если ничего не изменилось.
Метод безопасен для передачи в качестве указателя (контекст не теряется), смотрите пример
С другой стороны, непосредственно вызов метода не вызывает перерисовки холста, он только указывает на то, что его надо перерисовать во время следующего этапа рендеринга

#### Пример:

	atom.dom('#update-button').bind({
		'click' : libcanvas.update
	});

#### Возвращает `this`

## Метод listenMouse

Указывает на то, что надо слушать события мыши. Создаёт свойство `mouse`.

#### Возвращает `this`

## Метод listenKeyboard

Указывает на то, что надо слушать события мыши. Создаёт свойство `keyboard`.

#### Возвращает `this`

## Метод getKey

Возвращает true, если клавиша с таким названием зажата или false в другом случае.

#### Пример:

	if (libcanvas.getKey('aleft')) {
		this.turnLeft();
	}

## Метод createBuffer

	canvasElement createBuffer(int width, int height)

Создаёт буфер, который равен по размерам рабочему элементу или тем размерам, что переданы аргументами


#### Пример:

	// Мы получили буфер, который равен рабочему элементу
	var buffer = libcanvas.createBuffer();

## Метод createShaper

Создаёт и возвращает экземпляр LibCanvas.Ui.Shaper, который используется для отрисовки примитивных фигур


#### Пример:

	libcanvas.createShaper({
		shape: new Circle(100, 100, 50),
		fill : 'red',
		hover: { fill: 'red' }
	})
	.clickable()
	.draggable();

## Методы addElement/rmElement

Добавляет или удаляет элемент, который реализует интерфейс Behaviours.Drawable для автоматической отрисовки каждый кадр.

#### Пример:

	var MyText = atom.Class({
		Implements: [Drawable],
		initialize: function (text) {
			this.text = text;
		},
		draw: function () {
			this.libcanvas.ctx.text({ text: this.text });
		}
	});

	libcanvas.addElement(new MyText('Hello World'));

## Метод rmAllElements

Удаляет все элементы, добавленные через `addElement`

#### Пример:
	libcanvas.rmAllElements();

#### Возвращает `this`

## Метод addFunc

	LibCanvas.Canvas2D addFunc(int priority = 10, function fn)

Добавляет функцию, которая вызывается каждый кадр перед рендером.

Чем выше значение необязательного аргумента `priority`, тем раньше выполнится функция.
Рекомендуется указывать значения в пределах 50-100 для функций, которые должны выполнится самыми первыми,
0-9 для тех, кто должны выполниться последними и 10-49 если приоритет не имеет значения.

Контекст функции - ссылка на объект libcanvas.
Первый аргумент - время, которое прошло с вызова предыдущей функции.
Это время может использоваться для стабильной скорости приложения, несмотря на fps

#### Пример:

	libcanvas.addFunc(function (time) {
		var move = {x:0, y:0};
		if (this.getKey('aleft' )) move.x = -1 * time;
		if (this.getKey('aright')) move.x =  1 * time;
		if (this.getKey('aup'   )) move.y = -1 * time;
		if (this.getKey('adown' )) move.y =  1 * time;

		unit.position.move(move);

		// this == libcanvas
	});

#### Возвращает `this`

## Метод addRender

	LibCanvas.Canvas2D addRender(int priority = 10, function fn)

Метод подобен методу `addFunc`, но содержимое обязано выполнять не просчёт, а рендер сцены.
Основное отличие от `addFunc` в том, что функции, переданные в `addRender` выполняются только тогда, когда был вызван `libcanvas.update()` в одной из функций, переданных в `libcanvas.addFunc`

#### Пример:

	libcanvas.addRender(function (time) {
		this.ctx.fillAll('red');

		// this == libcanvas
	});

#### Возвращает `this`

## Метод rmFunc

	LibCanvas.Canvas2D rmFunc(function fn)

Отписывает функцию, добавленную через addFunc или addRender

#### Пример:

	var render = function (time) { this.ctx.fillAll('red'); }

	libcanvas.addRender( render );

	atom.dom( '.stop-filling-red' ).bind( 'click', function () {
		libcanvas.rmFunc( render );
	});

#### Возвращает `this`

## Метод start

Начинает отрисовку. Первым аргументом можно передать функцию, которая будет добавлена с помощью `addRender`

#### Пример:

	libcanvas.start(function (time) {
		this.ctx.fillAll('red');

		// this == libcanvas
	});

#### Возвращает `this`

# Управление слоями

Стоит помнить, что LibCanvas позволяет очень гибко оперировать слоями.
Ваш основной слой, который вы создали при инициализации носит имя "main".
Его нельзя удалить, заменить или переименовать.

Но вы можете создавать неограниченное количество слоёв с уникальными именами.

Созданный слой будет точно таким же элементом, как родительский libcanvas, со всеми его методами, но собственным апдейтом, набором коллбеков и элементами.

Не стоит добавлять каждый элемент на отдельный слой. Желательно выделить группы элементов, например "задний план", "объекты" и "панель управления" и обновлять определённый слой только при изменении соответсвующего объекта.


## Метод createLayer

	LibCanvas.Layer createLayer(string name, int z = Infinity);

Создаёт новый слой, если имя `name` не занято. 
Второй опциональный аргумент позволяет указать zIndex.

#### Пример:

	var libcanvasChild = libcanvas.createLayer('child');

	libcanvas instanceof LibCanvas; // true
	libcanvas instanceof LibCanvas.Layer; // false

	libcanvasChild instanceof LibCanvas; // true;
	libcanvasChild instanceof LibCanvas.Layer; // true

## Метод layer

	LibCanvas.Canvas2D layer(string name);

Возвращает слой с именем name, если он есть, иначе - бросает исключение.
У всех слоёв одна область видимости, потому неважно, к которому применять этот метод.

#### Пример:
	
	libcanvas.createLayer('first' );
	libcanvas.createLayer('second');

	var first = libcanvas.layer('first');

	libcanvas.layer('second') == first.layer('second'); // true
	first.layer('main') == libcanvas; // true

## Свойства

`zIndex` - zIndex слоя. При указании `Infinity` - поднимается в самый верх, `0` - падает вниз.

`topLayer` (*LibCanvas.Canvas2D*) - возвращает слой, который находится в самом верху.


#### Пример:

	var top = libcanvas.createLayer('top');
	top.zIndex = 0; // опускаем слой в самый низ

	top.zIndex = Infinity; // поднимаем слой в самый верх

	libcanvas.topLayer == top; // true

## Примечание

Стоит понять, как работает zIndex. Он может быть любым положительным числом от единицы до бесконечности, но не больше, чем количество слоёв на данный момент.

Когда вы передаёте "ноль" - слою присваивается индекс "единица", а все остальные - сдвигаются. Когда "бесконечность" - передаётся самый большой возможный индекс. Например:

	libcanvas.createLayer('second');
	libcanvas.createLayer('third');
	/* 'main'.z   == 1
	 * 'second'.z == 2
	 * 'third'.z  == 3
	 */

	// Поднимаем слой вверх:
	libcanvas.zIndex = Infinity;
	/* 'second'.z == 1
	 * 'third'.z  == 2
	 * 'main'.z   == 3
	 */
Видно, что слой сместил все слои так, чтобы zIndex шёл по-порядку.

	libcanvas.createLayer('fourth');
	/* 'second'.z == 1
	 * 'third'.z  == 2
	 * 'main'.z   == 3
	 * 'fourth'.z == 4
	 */

Мы видим, что, хотя мы присвоили слою 'main' zIndex Infinity - он занял место 3 (самое большое на момент создания) и теперь уступил верхушку новому слою.

