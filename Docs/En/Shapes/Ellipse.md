LibCanvas.Shapes.Ellipse
========================

`Ellipse` is the heir of the figure` Rectangle`. Draws an ellipse in the rectangle described by the `from` and `to` points

```js
var ellipse = new Ellipse ({from: [10, 10], to: [100, 50]});
```

[Usage Example] (http://libcanvas.github.com/shapes/ellipse.html)

#### Global

After calling LibCanvas.extract (), you can use the short alias "Ellipse"

## Properties

### angle
Angle of rotation of the ellipse. Essence - an ellipse inscribed in a rectangle, and then deployed around the center to the property `angle`

## Rotate method

```js
LibCanvas.Shapes.Ellipse rotate (int degree)
```

Rotates the ellipse to `degree` around the center.

#### Returns `this`