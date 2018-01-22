LibCanvas.Shapes.Rectangle
==========================

`LibCanvas.Shapes.Rectangle` - the basic figure in LibCanvas, which is used including in the canvas drawing (for example in `ctx.drawImage`)

#### Global

After calling LibCanvas.extract (), you can use the short alias "Rectangle"

## Creating an instance of LibCanvas.Shapes.Rectangle

```js
// coordinates of the first point and dimensions
var rect = new LibCanvas.Shapes.Rectangle (xFromCoord, yFromCoord, width, height);

// two points LibCanvas.Point - where and where
var rect = new LibCanvas.Shapes.Rectangle (fromPoint, toPoint);

// point LibCanvas.Point - where and the size of LibCanvas.Size
var rect = new LibCanvas.Shapes.Rectangle (fromPoint, size);

// parameter object (there must be two any arguments of three, for example, from and size)
var rect = new LibCanvas.Shapes.Rectangle ({
    from: fromPoint,
    to: toPoint,
    size: size
});

// Alternative way - through the center and size:
var rect = new LibCanvas.Shapes.Rectangle ({
    center: new Point (80, 95),
    size: new Size (20, 10)
}); // == new Rectangle (70, 90, 20, 10);

```

You can experiment with the kind of arguments LibCanvas is very flexible and will adjust to what you are writing. But be careful with this:

```js
var rect = new LibCanvas.Shapes.Rectangle (
    new LibCanvas.Point (5, 10),
    new LibCanvas.Size (15, 20);
);

var rect = new LibCanvas.Shapes.Rectangle ({
    from: [5, 10],
    size: {
        width: 15,
        height: 20
    }
});

var rect = new LibCanvas.Shapes.Rectangle ({
    to: new LibCanvas.Point (20, 30),
    size: [15, 20]
});
```

Do not forget that the points are passed by reference, because if you declared a rectangle through two points, when you change the point inside the rectangle, the original points will also change. With this effect, you can do many useful tricks

```js
var rect = new LibCanvas.Shapes.Rectangle (fromPoint, toPoint);
rect.from.x = 100;
atom.trace (fromPoint.x); // 100
```

If necessary, this behavior can be avoided by passing point clones

```js
var rect = new LibCanvas.Shapes.Rectangle (fromPoint.clone (), toPoint.clone ());
```

Or cloning the rectal:

```js
var rect = new LibCanvas.Shapes.Rectangle (fromPoint, toPoint).clone ();
```

## Properties

### width (set / get)
Get the width of the rectangle or change (by moving the point to in the x coordinate)

### height (set / get)
Get the width of the rectangle or change (by moving the point to in the y coordinate)

### bottomLeft (get)
Creates a new point with coordinates that correspond to the lower-left corner of the rectangle

### topRight (get)
Creates a new point with coordinates that correspond to the right upper corner of the rectangle

### center (get)
Creates a new point with coordinates that correspond to the center of the rectangle

### size (set / get)
Get / set the height and width of the rectangle in the format {width, height}

## HasPoint Method

```js
bool hasPoint (LibCanvas.Point point, int padding);
```

Returns true if the point is inside or on the boundary of a rectangle

#### argument `padding`

Allows for indentation from the border

#### Example

```js
var rect = new LibCanvas.Shapes.Rectangle ({
    from: [4, 4],
    to: [10, 10]
});

rect.hasPoint ([6, 6]); // true
rect.hasPoint ([2, 2]); // false
rect.hasPoint ([3, 3], 2); // false
```

## The align method

```js
LibCanvas.Shapes.Rectangle align (LibCanvas.Shapes.Rectangle rect, string sides);
```

Aligns a rectangle relative to another rectangle. sides can contain top / middle / bottom or left / center / right

```js
// center the rectangle relative to the canvas
context.fill (rectangle.align (context.rectangle, 'center middle'), 'red');
```

## The move method

```js
LibCanvas.Shapes.Rectangle move (LibCanvas.Point distance, bool reverse);
```

Calls the move method of both points

#### Example

```js
var rect = new LibCanvas.Shapes.Rectangle ({
    from: [4, 4],
    to: [8, 8]
});
rect.move ({x: 2, y: 3});
// rect.from == Point (6, 7)
// rect.to == Point (10, 11)
```

#### Returns `this`

## The draw method

```js
LibCanvas.Shapes.Rectangle draw (LibCanvas.Context2D ctx, String type);
```

Draws a rectangle to the context using the current settings

#### argument `type`
Method of rendering. It can take the values ​​`fill`,` stroke`, `clear`

#### Example

```js
var rect = new LibCanvas.Shapes.Rectangle (10, 10, 5, 5);
var ctx = canvasElem
    .getContext ('2d-libcanvas')
    .set ({
        'fillStyle': 'red',
        'strokeStyle': 'black'
    });

// Fill in the red rectangle in the context
rect.draw (ctx, 'fill');
// Circle the black rectangle in context
rect.draw (ctx, 'stroke');
```

But this method is recommended to be used only if for some reason the following is not available:

```js
var ctx = canvasElem
    .getContext ('2d-libcanvas')
    .fill (rect, 'red')
    .stroke (rect, 'black');
```

## moveTo

```js
LibCanvas.Shapes.Rectangle moveTo (LibCanvas.Shapes.Rectangle rect)
```

Moves the current rectangle so that it becomes equal to the rectangle passed by the argument

```js
var Rectangle = LibCanvas.Shapes.Rectangle;
var rectFrom = new Rectangle ({
    from: [10, 10],
    to: [20, 20]
});

var rectTo = new Rectangle ({
    from: [15, 15],
    to: [25, 25]
});

rectFrom.moveTo (rectTo);

rectFrom.from; // Point (15, 15);
rectFrom.to; // Point (25, 25);
```

#### Returns `this`

## The processPath method

```js
LibCanvas.Shapes.Rectangle processPath (LibCanvas.Context2D ctx, bool noWrap = false)
```
.
Passes the path using `ctx.moveTo`, `ctx.lineTo` starting from the `from` point clockwise

#### the argument `noWrap`
if specified in false (by default), then frames with beginPath, endPath

#### Example

```js
LibCanvas.Shapes.Rectangle ({
    from: [4, 5],
    to: [8, 9]
}). processPath (ctx);

// is equivalent to c:
ctx.beginPath ()
   .moveTo (4, 5) // rect.from
   .lineTo (4, 9) // topRight
   .lineTo (8, 9) // rect.to
   .lineTo (8, 5) // bottomLeft
   .lineTo (4, 5) // rect.from
   .closePath ();
```

## The getRandomPoint method

```js
LibCanvas.Point getRandomPoint (int margin = 0);
```

Returns a random point inside the rectangle

#### argument `margin`
if specified, the dot will be returned with indents

#### Examples

```js
var rect = LibCanvas.Shapes.Rectangle ({
    from: [10, 10],
    to: [90, 90]
});

// Return a random point whose coordinates are between 10 and 90
rect.getRandomPoint (); // for example Point (53, 87)

// Returns a random point whose coordinates are between 40 (10 + 30) and 60 (90-30)
rect.getRandomPoint (30); // for example Point (49, 43)

// Return a random point whose coordinates are between -20 (10-30) and 120 (90 + 30)
rect.getRandomPoint (-30); // for example Point (96, -5)
```

## The equals method

```js
bool equals (LibCanvas.Shapes.Rectangle rect, int accuracy)
```

Compares polygon points using the LibCanvas.Point.equals method

```js
var foo = new LibCanvas.Shapes.Rectangle (15, 20, 10, 5);
var bar = new LibCanvas.Shapes.Rectangle (15, 20, 10, 5);

trace (bar == foo); // false
trace (bar.equals (foo)); // true
```

## The clone method

```js
LibCanvas.Shapes.Rectangle clone ()
```

Returns a rectangle with the same coordinates

```js
var rect = new LibCanvas.Shapes.Rectangle (15, 20, 10, 5);
var clone = rect.clone ();

trace (rect == clone); // false
trace (rect.equals (clone)); // true
```