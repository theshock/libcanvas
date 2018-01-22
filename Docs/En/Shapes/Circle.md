Circle
======
`LibCanvas.Shapes.Circle` is a class that describes a simple geometric figure "circle"

#### Global

After calling LibCanvas.extract (), you can use the short alias "Circle"

## Creating an instance of LibCanvas.Shapes.Circle

```js
var circle = new LibCanvas.Shapes.Circle (centerX, centerY, radius);

var circle = new LibCanvas.Shapes.Circle (centerPoint, radius);

var circle = new LibCanvas.Shapes.circle ({
    center: centerPoint,
    radius: toPoint
});
```

Do not forget about passing objects by reference:

```js
var circle = new LibCanvas.Shapes.Circle (point, 10);
circle.center.x = 100;
alert (point.x); // 100
```

If necessary, this behavior can be avoided by passing a point clone

```js
var circle = new LibCanvas.Shapes.Circle (center.clone (), radius);
```

## HasPoint Method

```js
bool hasPoint (LibCanvas.Point point);
```

Returns true if the point is inside the circle

#### Example

```js
var circle = new LibCanvas.Shapes.Circle ({
    center: [25, 25],
    radius: 15
});
circle.hasPoint (new Point (22, 24)); // true
circle.hasPoint (new Point (88, 88)); // false
```

## The move method

```js
LibCanvas.Shapes.Center move (LibCanvas.Point distance, bool reverse);
```

Calls the move method at the center

#### Example

```js
var circle = new LibCanvas.Shapes.Circle ({
   center: [25, 25],
   radius: 15
});
circle.move ({x: 2, y: 3});
// circle.center == Point (27, 28)
```

#### Returns `this`

## The intersect method

```js
bool intersect (LibCanvas.Shape shape);
```

Checks the intersection of two figures. Exact if `shape` is a circle and through boundingRectangle if `shape` is another shape.

#### Example

```js
var circleA = new Circle (25, 25, 15);
var circleB = new Circle (30, 30, 10);
circleA.intersect (circleB); // true
```

## Method scale

```js
Circle scale (number power, LibCanvas.Point pivot);
```

Increases the circle in `power` times relative to the point `pivot` or relative to the center of the circle

#### Example

```js
var circle = new Circle (30, 30, 10);

circle.scale (2);

// Increase the circle twice:
//
// var circle = new Circle (30, 30, 20);
```

#### Returns `this`


## The draw method

```js
Circle draw (LibCanvas.Context2D ctx, String type);
```

Draws a circle to the context using the current settings

#### argument `type`
Method of rendering. It can take the values ​​`fill`, `stroke`, `clear`

#### Example

```js
var circle = new Circle (100, 100, 20);

var ctx = canvasElem
.getContext ('2d-libcanvas')
.set ({
    'fillStyle': 'red',
    'strokeStyle': 'black'
});
// Fill the circle with the red in the context
circle.draw (ctx, 'fill');
// Circle the circle in the context
circle.draw (ctx, 'stroke');
```

But this method is recommended to be used only if for some reason the following is not available:

```js
var ctx = canvasElem
.getContext ('2d-libcanvas')
.fill (circle, 'red')
.stroke (circle, 'black');
```

#### Returns `this`

## The processPath method

```js
Circle processPath (LibCanvas.Context2D ctx, bool noWrap = false)
```

Passes the path using `ctx.arc`

#### the argument `noWrap`
if specified in false (by default), then frames with `beginPath`, `endPath`

#### Example

```js
new Circle (100, 150, 30) .processPath (ctx);

// is equivalent to:

ctx
.beginPath ()
.arc (100, 150, 30, 0, Math.PI * 2, false)
.closePath ();
```

## The clone method

```js
Circle clone ()
```

Returns a new circle with the same radius and cloned center

#### Example

```js
var circle = new Circle (100, 150, 30);

var circleClone = circle.clone ();
```

## The equals method

```js
Circle equals (Circle circle)
```

Checks if two circles are equal

#### Example

```js
var circleA = new Circle (100, 150, 30);
var circleB = new Circle (100, 150, 30);

console.log (circleA == circleB); // false
console.log (circleA.equals (circleB)); // true
```