Plugins.Animation.Element
=========================

Класс, который используется для создания картинки-анимации для вставки в dom-дерево

```js
atom.dom Animation.Image.element( Animation animation );
atom.dom Animation.Image.element( Animation.Sheet sheet );
```

### Пример

```js
function appendAnimatedLogoTo( targetElement ) {
	var logoSheet = new Animation.Sheet({
		frames: new Animation.Frames( images.get('logo'), 50, 50 ),
		delay : 40,
		looped: true
	});

	Animation.Image.element( logoSheet ).appendTo( targetElement );
}
```