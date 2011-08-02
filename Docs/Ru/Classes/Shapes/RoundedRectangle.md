LibCanvas.Shapes.RoundedRectangle
=================================

`RoundedRectangle` - наследник фигуры `Rectangle`, отличается закруглёнными уголками. Полностью повторяет интерфейс родителя.

## Свойства

### radius (set/get)
радиус закругления уголков

## Метод setRadius

	LibCanvas.Shapes.RoundedRectangle setRadius(int radius);

Устанавливает радиус фигуры. Всего-лишь удобный алиас для `shape.radius = radius`.

	var roundedRectangle = new RoundedRectangle( 20, 20, 50, 60 ).setRadius( 5 );

#### Возвращает `this`

