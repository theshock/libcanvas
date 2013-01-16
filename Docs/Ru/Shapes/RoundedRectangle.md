LibCanvas.Shapes.RoundedRectangle
=================================

`RoundedRectangle` - наследник фигуры `Rectangle`, отличается закруглёнными уголками. Полностью повторяет интерфейс родителя.

#### Global

После вызова LibCanvas.extract() можно использовать короткий алиас "RoundedRectangle"

## Свойства

### radius (set/get)
радиус закругления уголков

## Метод setRadius

```js
LibCanvas.Shapes.RoundedRectangle setRadius(int radius);
```

Устанавливает радиус фигуры. Всего-лишь удобный алиас для `shape.radius = radius`.

```js
var roundedRectangle = new RoundedRectangle( 20, 20, 50, 60 ).setRadius( 5 );
```

#### Возвращает `this`

