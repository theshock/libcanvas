LibCanvas.App
=============

`LibCanvas.App` - основа для построения относительно высокопроизводительных приложений


## Создание

	new LibCanvas.App(element, options)

#### аргумент `element`

В качестве первого аргумента принимается указатель на html-элемент. Это может быть css-селектор, dom-объект, или объект atom.

#### аргумент `options`

* `invoke` `true|false` - вызывать ли метод `onUpdate` у всех переданных элементов, по умолчанию - true. Если метод `onUpdate` не используется - лучше ставить `false`

* `fps` - максимальный fps, к которому необходимо стремиться. LibCanvas не будет превышать это значение, но если браузер будет не справляться, то библиотека будет динамически подстраиваться под компьютер, чтобы не было зависаний и пропусков кадров.

* `preloadImages` - хеш картинок, которые необходимо предзагрузить и которые будут доступны в ресурсах через метод `getImage`

* `preloadAudio` - хеш звуковых файлов, которые необходимы для работы приложения (на данный момент они не связаны с событием `ready`). Звёздочка заменяется на `ogg` или `mp3`, зависимо от того, что поддерживает браузер. Звуки будут доступны в ресурсах через метод `getAudio`

* `width` - ширина окна приложения в пикселях

* `height` - высота окна приложения в пикселях

* `keyboard` - подписаться ли на события клавиатуры

* `mouse` - подписаться ли на события мыши

#### Пример:

	var app = new LibCanvas.App('#my-canvas', {
		fps: 60,
		width : 800,
		height: 500,
		mouse : true,
		keyboard: true,
		preloadImages: {
			'first' : '/images/first.png',
			'second': '/images/second.png'
		},
		preloadAudio: {
			'shot' : '/sounds/shot.*'
		}
	});

## Разметка

Достаточно создать один тег и передать ссылку на него в LibCanvas.App:

	<body>
		<canvas id="my-first-canvas"></canvas>
	</body>
	<script>
		new LibCanvas.App('#my-first-canvas');
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

`libcanvas` - ссылка на основной объект `LibCanvas.Canvas2D`

`resources` - ссылка на соответсвующий регистр ресурсов `LibCanvas.Scene.Resources`

## Метод createScene

	LibCanvas.Scene.Standard createScene(string name = null, number zIndex = Infinity, object options = {});

Создаёт новую сцену, привязанную к слою `name`, `options` - настройки для сцены. (см. `LibCanvas.Scene.Standard`)

#### Пример:

	var scene = app.createScene({ intersection: 'manual' });
	var scene = app.createScene( 'background', 0 );

## Метод sceneExists

	boolean sceneExists(string name)

Проверяет существует ли сцена с именем `name`

#### Пример:

	if (app.sceneExists('main')) {
		// do smth
	}

## Метод scene

	boolean scene(string name)

Возвращает сцену с именем `name` или выбрасывает `Error`, если такой сцены нет

#### Пример:

	var bgScene = app.scene('bg'):


## Метод ready

	LibCanvas.App ready(function callback)

Подписывается на событие готовности приложения (когда загружены все картинки)

#### Пример:

	var app = new LibCanvas.App('#my-canvas', {
		preloadImages: {
			'first' : '/images/first.png',
			'second': '/images/second.png'
		}
	}).ready(function () {
		controller.render( this.resources.getImage('first') );
	});
