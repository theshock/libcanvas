LibCanvas.Shapes.RoundedRectangle
=================================

`RoundedRectangle` - the heir of the figure `Rectangle`, differs rounded corners. Completely repeats the parent interface.

#### Global

After calling LibCanvas.extract (), you can use the short alias "RoundedRectangle"

## Properties

### radius (set / get)
radius of curvature of corners

## setRadius

```js
LibCanvas.Shapes.RoundedRectangle setRadius (int radius);
```

Sets the radius of the shape. Just a handy alias for `shape.radius = radius`.

```js
var roundedRectangle = new RoundedRectangle (20, 20, 50, 60) .setRadius (5);
```

#### Returns `this`