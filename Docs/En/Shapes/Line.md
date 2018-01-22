LibCanvas.Shapes.Line
=====================

#### Global

After calling LibCanvas.extract (), you can use the short alias "Line"

## Creating an instance of LibCanvas.Shapes.Line

```js
// two points LibCanvas.Point - where and where
var line = new LibCanvas.Shapes.Line (fromPoint, toPoint);

// the parameter object
var line = new LibCanvas.Shapes.Line ({
    from: fromPoint,
    to: toPoint
});
```

Do not forget that points are passed by reference, because if you declared line through two points, when you change the point inside the line, the original points will also change.

```js
var line = new Line (fromPoint, toPoint);
line.from.x = 100;
alert (fromPoint.x); // 100
```

If necessary, this behavior can be avoided by passing point clones

```js
var line = new LibCanvas.Shapes.Line (fromPoint.clone (), toPoint.clone ());
```

Or cloning the line:

```js
var line = new LibCanvas.Shapes.Line (fromPoint, toPoint) .clone ();
```

## Properties

### length (get)
Get the length of the line

### center (get)
Creates a new point with coordinates that correspond to the center of the line

```js
var line = new Line ({
    from: [10, 10],
    to: [20, 20]
});
line.center; // Point (15, 15)
```

## HasPoint Method

```js
bool hasPoint (LibCanvas.Point point);
```

Returns true if the point is on the line

#### Example

```js
var line = new LibCanvas.Shapes.Line ({
    from: [4, 4],
    to: [8, 8]
});
line.hasPoint ([6, 6]); // true
line.hasPoint ([2, 5]); // false
```

## The move method

```js
LibCanvas.Shapes.Line move (LibCanvas.Point distance, bool reverse);
```

Calls the move method of both points

#### Example

```js
var line = new LibCanvas.Shapes.Line ({
from: [4, 4],
to: [8, 8]
});
line.move ({x: 2, y: 3});
// line.from == Point (6, 7)
// line.to == Point (10, 11)
```

#### Returns `this`

## The processPath method

```js
LibCanvas.Context2D processPath (LibCanvas.Context2D ctx, bool noWrap = false)
```

Paves the way with the help from the `from` point using `ctx.moveTo` to the `to` point using `ctx.lineTo`

#### the argument `noWrap`
if specified in false (by default), then frames with beginPath, endPath

#### Example

```js
LibCanvas.Shapes.Line ({
    from: [4, 4],
    to: [8, 8]
}).processPath(ctx);

// is equivalent to c:
ctx.beginPath ()
   .moveTo (4, 4) // line.from
   .lineTo (8, 8) // line.to
   .closePath ();
```

#### Returns `this`

## The perpendicular method

```js
LibCanvas.Point perpendicular (LibCanvas.Point point)
```

Returns the perpendicular of the point `point` to the current line

#### Example

```js
var line = new LibCanvas.Shapes.Line ([0,3], [4,0]);
var point = new LibCanvas.Point (0, 0);

line.perpendicular (point); // Point (1.44, 1.92)
```

## The intersect method

```js
bool intersect (LibCanvas.Shapes.Line line)
LibCanvas.Point intersect (LibCanvas.Shapes.Line line, true)
```

Determines the intersection of a line with another line. If the `point` parameter is `true`, then the intersection point or `null` will return, if it is not present, `true` or `false` will return.

```js
var first = new Line ([10, 10], [20, 20]);
var second = new Line ([10, 20], [20, 10]);

trace (first.intersect (second)); // true
trace (first.intersect (second, true)); // Point (15, 15)
```

## DistanceTo method

```js
Number distanceTo (LibCanvas.Point point, boolean asInfinitiveLine)
```

Specifies the distance between the line and the point `point`. If `asInfinitiveLine = true`, then the line will be considered an infinite straight line, otherwise - a line.

```js
var line = new Line (10, 10, 20, 20),
    point = new Point (41, 40);

line.distanceTo (point); // 29
line.distanceTo (point, true); // 0.7071
```

## The equals method

```js
bool equals (LibCanvas.Shapes.Line line, int accuracy)
```

Compare line points using the LibCanvas.Point.equals method


```js
var foo = new LibCanvas.Shapes.Line (15, 20, 10, 5);
var bar = new LibCanvas.Shapes.Line (15, 20, 10, 5);

trace (bar == foo); // false
trace (bar.equals (foo)); // true
```

## The clone method

```js
LibCanvas.Shapes.Line clone ()
```

Returns a line with the same coordinates

```js
var line = new LibCanvas.Shapes.Line (15, 20, 10, 5);
var clone = line.clone ();

trace (line == clone); // false
trace (line.equals (clone)); // true
```