LibCanvas.Shapes.Ellipse
========================

`Ellipse` - наследник фигуры `Rectangle`. Врисовывает эллипс в ректанг, описанный точками `from` и `to`

	var ellipse = new Ellipse({ from: [10, 10], to: [100, 50] });

[Пример использования »](http://libcanvas.github.com/shapes/ellipse.html)

## Свойства

### angle
угол поворота эллипса. Суть - эллипс вписан в прямоугольник, а потом развёрнут вокруг центра на свойство `angle`

## Метод rotate

	LibCanvas.Shapes.Ellipse rotate(int degree)

Поворачивает эллипс на `degree` градусов вокруг центра.

#### Возвращает `this`
