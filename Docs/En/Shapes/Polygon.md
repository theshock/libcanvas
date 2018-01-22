Polygon
=======

`LibCanvas.Shapes.Polygon` - describes a polygon through a set of points.

#### Global

After calling LibCanvas.extract (), you can use the short alias "Polygon"

## Creating an instance of LibCanvas.Shapes.Polygon

```js
var polygon = new LibCanvas.Shapes.Polygon (pointsArray);
```

#### Example

```js
var polygon = new Polygon ([
    [120, 30],
    [200, 10],
    [240, 120],
    [150, 150],
    [100, 100]
]);

var triangle = new Polygon ([
    new Point (300, 300),
    new Point (400, 300),
    new Point (320, 390)
]);
```

## get length

Returns the number of polygon points:

#### Example

```js
var triangle = new Polygon ([
    new Point (300, 300),
    new Point (400, 300),
    new Point (320, 390)
]);

console.log (triangle.length); // 3
```

## get center

Returns the center of the polygon:

#### Example

```js
var triangle = new Polygon ([
    new Point (300, 300),
    new Point (400, 300),
    new Point (320, 390)
]);

console.log (triangle.center); // Point (340, 330);
```

## The get method

```js
LibCanvas.Point get (int index);
```

Returns the polygon point

#### Example

```js
var triangle = new Polygon ([
    new Point (300, 300),
    new Point (400, 300),
    new Point (320, 390)
]);
triangle.get (2); // Point (300, 400)
```

## HasPoint Method

```js
bool hasPoint (LibCanvas.Point point);
```

Returns true if the point is inside the polygon

#### Example

```js
var triangle = new Polygon ([
    new Point (300, 300),
    new Point (400, 300),
    new Point (320, 390)
]);
triangle.hasPoint (new Point (305, 305)); // true
triangle.hasPoint (new Point (188, 212)); // false
```

## The move method

```js
Polygon move (LibCanvas.Point distance, bool reverse);
```

Calls the move method on all polygon points

#### Example

```js
var triangle = new Polygon ([
    new Point (300, 300),
    new Point (400, 300),
    new Point (320, 390)
]);
triangle.move (new Point (42, 13));
```

#### Returns `this`

## Rotate method

```js
Polygon rotate (number angle, LibCanvas.Point pivot);
```

Rotates the polygon around the `pivot` point to the `angle` radian.

#### Example

```js
var triangle = new Polygon ([
    new Point (300, 300),
    new Point (400, 300),
    new Point (320, 390)
]);

// rotate the triangle around the center
triangle.rotate ((6) .degree (), triangle.center);

// rotate the triangle around one of the vertices
triangle.rotate ((6) .degree (), triangle.get (0));
```

#### Returns `this`

## Method scale

```js
Polygon scale (number power, LibCanvas.Point pivot);
```

Increases the polygon in `power` times relative to the point `pivot`

#### Example

```js
var triangle = new Polygon ([
    new Point (300, 300),
    new Point (400, 300),
    new Point (320, 390)
]);

triangle.scale (0.5, triangle.center);

// Duplicate the polygon twice:
//
// Polygon (
//     Point (320, 315),
//     Point (370, 315),
//     Point (330, 360)
// );
```

#### Returns `this`


## The draw method

```js
Polygon draw (LibCanvas.Context2D ctx, String type);
```

Draws a polygon in the context using the current settings

#### argument `type`
Method of rendering. It can take the values ​​`fill`, `stroke`, `clear`

#### Example

```js
var poly = new Polygon ([
    new Point (300, 300),
    new Point (400, 300),
    new Point (320, 390)
]);

var ctx = canvasElem
    .getContext ('2d-libcanvas')
    .set ({
    'fillStyle': 'red',
    'strokeStyle': 'black'
});

// Fill in the red polygon in the context
poly.draw (ctx, 'fill');
// Circle the black polygon in context
poly.draw (ctx, 'stroke');
```

But this method is recommended to be used only if for some reason the following is not available:

```js
var ctx = canvasElem
    .getContext ('2d-libcanvas')
    .fill (poly, 'red')
    .stroke (poly, 'black');
```

#### Returns `this`

## The processPath method

```js
LibCanvas.Shapes.Polygon processPath (LibCanvas.Context2D ctx, bool noWrap = false)
```

Passes the path using `ctx.moveTo`, `ctx.lineTo` starting from the first point clockwise

#### the argument `noWrap`
if specified in false (by default), then frames with `beginPath`, `endPath`

#### Example

```js
var poly = new Polygon ([
    new Point (300, 300),
    new Point (400, 300),
    new Point (320, 390)
]);
poly.processPath (ctx);

// is equivalent to:

ctx
.beginPath ()
    .moveTo (new Point (300, 300))
    .lineTo (new Point (400, 300))
    .lineTo (new Point (320, 390))
    .closePath ();
```

## The invoke method

```js
LibCanvas.Shapes.Polygon invoke (string method, mixed args [..])
```

Calls the method method at all polygon points with parameters from the remaining arguments of the function

#### Example

```js
var poly = new Polygon ([
    new Point (300, 300),
    new Point (400, 300),
    new Point (320, 390)
]);
// Round all the coordinates
poly.invoke ('map', function (value) {
    return Math.round (value);
});
```

#### Returns `this`

## The clone method

```js
LibCanvas.Shapes.Polygon clone ()
```

Returns a new polygon with slanted dots

#### Example

```js
var poly = new Polygon ([
    new Point (299.6, 300.3),
    new Point (400.2, 300.4),
    new Point (319.8, 390.1)
]);

var polyClone = poly.clone ();
```

## The intersect method

```js
LibCanvas.Shapes.Polygon intersect (shape)
```

Checks whether the shape `shape` intersects the current polygon. Polygons compare through the intersection of lines, the remaining figures - through the intersection of `boundingShape`

#### Example

```js
var poly1 = new Polygon ([
    new Point (300, 300),
    new Point (400, 300),
    new Point (320, 390)
]);
var poly2 = new Polygon ([
    new Point (250, 250),
    new Point (350, 300),
    new Point (300, 400)
]);

console.log (poly1.intersect (poly2)); // true
```