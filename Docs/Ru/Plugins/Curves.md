Plugins.Curves
==============

Отрисовка кривых безье с динамической шириной и цветом. Расширяет встроенный объект Context2D ('2d-libcanvas'), предоставляя удобный метод `drawCurve`

![libcanvas curves example](https://raw.github.com/theshock/libcanvas/master/Docs/Ru/Plugins/curves.png)

### Инициализация

```js
Context2D drawCurve(object params)
```

* `from` (*Point*) - точка начала кривой
* `to` (*Point*) - точка окончания кривой
* `points` (*Point[]*) - массив контрольный точек. Может содержать 0, 1 или 2 точки
* `inverted` (*Boolean*) - добавляет "ленточность" (см. скриншот выше)
* `gradient` (*object*) - описывает плавное изменение цвета кривой
	* `from` (*string*) - начальный цвет
	* `to` (*string*) - окончательный цвет
	* `fn` (*string*) - функция изменения цвета (см. [atom.Transition](https://github.com/theshock/atomjs/blob/master/Docs/En/Declare/Transition.md))
* `width` (*object*) - описывает плавное изменение цвета кривой
	* `from` (*number*) - начальная ширина
	* `to` (*number*) - начальная ширина
	* `fn` (*string*) - функция изменения ширины (см. [atom.Transition](https://github.com/theshock/atomjs/blob/master/Docs/En/Declare/Transition.md))

```js

ctx.drawCurve({
	from  : new Point(100, 250),
	to    : new Point(200, 100),
	points: [ new Point(100, 100), new Point(250, 250) ],
	inverted: true,
	gradient:{
		from: '#ff0',
		to  : '#f00',
		fn  : 'linear'
	},
	width:{
		from: 30,
		to  : 1,
		fn  : 'sine-in'
	}
});
```