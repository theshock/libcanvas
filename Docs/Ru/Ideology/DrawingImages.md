Отрисовка картинок
==================

Отрисовка картинок - одна из базовых вещей при создании JavaScript-приложения. Зависимо от целей есть несколько способов сделать это
Если вам всего-лишь необходимо однажды отрисовать картинку на Холст - достаточно пойти способом, аналогичным plain-html:

	var img = atom.dom.create('img', { src: 'images/draw.png' })
		.bind('load', function () {
			atom.dom( 'canvas' ).first
				.getContext( '2d-libcanvas' )
				.drawImage( img );
		});

Другим путём необходимо идти, если вы активировали холст как объект LibCanvas. Тогда однажды отрисованная картинка затрётся при следующем кадре.
Для того, чтобы этого избежать - необходимо отрисовывать картинку каждый кадр. Самый простой способ - это подписаться на этап рендеринга:

	new LibCanvas('canvas', {
		preloadImages: { foo: 'images/draw.png' }
	}).start(function () {
		this.ctx.drawImage( this.getImage('foo') );
	});

Но такой способ не даёт расширяемости и гибкости. Самый корректный способ - это создать специальный `Drawable` объект для отрисовки картинок:

	LibCanvas.extract();

	var ImageDrawer = atom.Class({
		Extends: DrawableSprite,

		initialize: function (sprite, shape) {
			this.sprite = sprite;
			this.shape  = shape;
		}
	});

	new LibCanvas('canvas', {
		preloadImages: { foo: 'images/draw.png' }
	})
	.start()
	.addEvent('ready', function () {
		var drawTo = new Rectangle( 0, 0, 100, 100 );
		var drawer = new ImageDrawer( this.getImage('foo'), drawTo );
		this.addElement( drawer );
	});

Такой способ даёт максимальную гибкость. Далее, на базе этого объекта мы можем создавать огромное количество картинок и наделять их любыми возможностями, например, `Draggable`:

	LibCanvas.extract();

	var ImageDrawer = atom.Class({
		Extends: DrawableSprite,

		Implements: Draggable,

		initialize: function (libcanvas, spriteName, shape) {
			libcanvas.addElement( this );
			this.sprite = libcanvas.getImage( spriteName );
			this.shape  = shape;
		}
	});

	new LibCanvas('canvas', {
		preloadImages: {
			foo: 'images/foo.png',
			bar: 'images/bar.png'
		}
	})
	.listenMouse()
	.start()
	.addEvent('ready', function () {
		new ImageDrawer( this, 'foo', new Rectangle(   0, 0, 100, 100 ) ).draggable();
		new ImageDrawer( this, 'bar', new Rectangle( 200, 0, 100, 100 ) ).draggable();
	});

## Пример

[Отрисовка и изменение простой картинки](libcanvas.github.com/ui/plain-image.html)