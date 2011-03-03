LibCanvas.Canvas2D
==================

`LibCanvas.Canvas2D` - это ключевой объект, вокруг которого строится вся анимация.

## Создание

	new LibCanvas(element, options)

#### аргумент `element`
	
В качестве первого аргумента принимается указатель на html-элемент. Это может быть css-селектор, dom-объект, или объект atom.

#### аргумент `options`


* `clear` (*bool|string*) Означает, очищать ли перед каждым кадром холст. ВОзможные значения:
* * `false` - не очищать
* * `true` (по-умолчанию) - очищать
* * (*string*) - залить указанным стилем

* `backBuffer` `off|on` - использовать ли бек-буфер (по-умолчанию - используется)

* `fps` - максимальный fps, к которому необходимо стремиться. LibCanvas не будет превышать это значение, но если браузер будет не справляться, то библиотека будет динамически подстраиваться под компьютер, чтобы не было зависаний и пропусков кадров.

* `preloadImages` - хеш картинок, которые необходимо предзагрузить и которые будут доступны через метод getImage

* `preloadAudio` - хеш звуковых файлов, которые необходимы для работы приложения (на данный момент они не связаны с событием `ready`). Звёздочка заменяется на `ogg` или `mp3`, зависимо от того, что поддерживает браузер. Звуки будут доступны через метод `getAudio()`

#### Пример:

	var libcanvas = new LibCanvas('#my-canvas', {
		fps: 24,
		clear: '#333',
		backBuffer: 'off',
		preloadImages: {
			'first' : '/images/first.png',
			'second': '/images/second.png'
		},
		preloadAudio: {
			'shot' : '/sounds/shot.*'
		}
	});

## Свойства

`ctx` - ссылка на активный контекст, следует использовать при отрисовке. Например:

	libcanvas.ctx.fillAll('green');

`mouse` - ссылка на объект `LibCanvas.Mouse`. Активируется после использования метода `listenMouse()`

`keyboard` - ссылка на объект `LibCanvas.Keyboard`. Активируется после использования метода `listenKeyboard()`

## События

`ready` - вызывается, когда все изображения загружены и libcanvas готов к отрисовке.

## Метод set

Позволяет указать атрибуты html-элемента

#### Пример:

	libcanvas.set({
		width : 400,
		height: 250
	});

## Метод update

Указывает на то, что картинка изменена и необходимо перерендерить изображение.
Внимание! Кадр не будет рендерится до вызова update. Это сделано в целях оптимизации - чтобы холст не перерисовывался, если ничего не изменилось.
Метод безопасен для передачи в качестве указателя (контекст не теряется), смотрите пример
Подробнее про способ использования метода смотрите в разделе `Ideology`

#### Пример:

	atom('#update-button').bind({
		'click' : libcanvas.update
	});

## Метод listenMouse

Указывает на то, что надо слушать события мыши. Создаёт свойство `mouse`.

## Метод listenKeyboard

Указывает на то, что надо слушать события мыши. Создаёт свойство `keyboard`.

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

## Метод addFunc
## Метод addRender

## Метод start

Начинает отрисовку.

