Plugins.Animation.Frames
========================

Класс, который используется для "нарезки" картинок из одной тайловой картинки.
Обычно кадры анимации похожи между собой и имеет смысл множество их собрать в одно изображение подобно технологии css-sprites.
Допустим, у вас ширина кадра анимации 50 пикселей, высота - 40, 15 кадров. Вы можете нарисовать их в три ряда в картинке размером 250*120.

![Пример нарезки кадров анимации](https://raw.github.com/theshock/libcanvas/master/Docs/Ru/Plugins/Animation/frames-demo.png)

### Инициализация

```js
new Animation.Frames( Image image, int width = null, int height = null )
```

* `image` (*Image*) - картинка-источник для нарезки
* `width` (*int*) - ширина кадра. Равен ширине картинки, если `null`
* `height` (*int*) - высота кадра. Равен высоте картинки, если `null`


```js
var frames = new Animation.Frames( images.get('ship'), 100 );
```

### Методы

`get length` - количество кадров в массиве

```js
console.log( frames.length );
```


#### get

```js
canvasElement get( int index );
```

Возвращает картинку-кадр, часть исходной картинки.

```js
var frame = frames.get( 5 );
```

