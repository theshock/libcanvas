Path
====

`LibCanvas.Shapes.Path` - used to create shapes based on Bezier curves.

#### Global

After calling LibCanvas.extract (), you can use the short alias "Path"

## Creating an instance of LibCanvas.Shapes.Path

```js
var polygon = new LibCanvas.Shapes.Path ();
```

#### Example

```js
var path = new Path ();
```

## get length

Returns the number of steps in the path:

#### Example

```js
pathFrom = new Point (150, 200);

path = new Path ()
    .moveTo (pathFrom)
    .curveTo ([300, 200], [250, 150])
    .curveTo ([200, 280], [290, 250])
    .curveTo (pathFrom, [220, 220]);

console.log (path.length); // 4
```

## Description of the path steps

### moveTo

```js
Path moveTo (LibCanvas.Point point);
```

Add a move step to the point `point`

#### Example

```js
path.moveTo (new Point (100, 150));
```

### lineTo

```js
Path lineTo (LibCanvas.Point point);
```

Draw a line to the point `point`

#### Example

```js
path.lineTo (new Point (100, 150));
```

### curveTo

```js
Path curveTo (LibCanvas.Point point, LibCanvas.Point cp1, LibCanvas.Point cp2 = null);
```

Draw a curved line to the point `point`

#### Example

```js
// Quadratic curve
path.curveTo (new Point (100, 150), new Point (50, 50));
// Cubic curve
path.curveTo (new Point (100, 150), new Point (50, 50), new Point (80, 40));
```

## HasPoint Method

```js
bool hasPoint (LibCanvas.Point point);
```

Returns true if the point is inside the path

#### Example

```js
pathFrom = new Point (150, 200);

path = new Path ()
    .moveTo (pathFrom)
    .curveTo ([300, 200], [250, 150])
    .curveTo ([200, 280], [290, 250])
    .curveTo (pathFrom, [220, 220]);

path.hasPoint (new Point (160, 200)); // true
path.hasPoint (new Point (666, 200)); // false
```

## The move method

```js
Path move (LibCanvas.Point distance, bool reverse);
```

Calls the move method on all waypoints. If the point repeats several times, it moves only once

#### Example

```js
pathFrom = new Point (150, 200);

path = new Path ()
    .moveTo (pathFrom)
    .curveTo ([300, 200], [250, 150])
    .curveTo ([200, 280], [290, 250])
    .curveTo (pathFrom, [220, 220]);

path.move (new Point (42, 13));
```

#### Returns `this`

## Rotate method

```js
Path rotate (number angle, LibCanvas.Point pivot);
```
Rotates the path around the `pivot` point to the `angle` radian.

#### Example

```js
pathFrom = new Point (150, 200);

path = new Path ()
    .moveTo (pathFrom)
    .curveTo ([300, 200], [250, 150])
    .curveTo ([200, 280], [290, 250])
    .curveTo (pathFrom, [220, 220]);

// rotate the path around the center
path.rotate ((6) .degree (), path.center);
```

#### Returns `this`

## Method scale

```js
Path scale (number power, LibCanvas.Point pivot);
```

Increases the path in `power` times relative to the point `pivot`

#### Example

```js
pathFrom = new Point (150, 200);

path = new Path ()
    .moveTo (pathFrom)
    .curveTo ([300, 200], [250, 150])
    .curveTo ([200, 280], [290, 250])
    .curveTo (pathFrom, [220, 220]);

// Skived the way twice:
path.scale (0.5, path.center);
```

#### Returns `this`


## The draw method

```js
Path draw (LibCanvas.Context2D ctx, String type);
```

Draws the path to the context using the current settings

#### argument `type`
Method of rendering. It can take the values ​​`fill`, `stroke`, `clear`

#### Example

```js
pathFrom = new Point (150, 200);

path = new Path ()
    .moveTo (pathFrom)
    .curveTo ([300, 200], [250, 150])
    .curveTo ([200, 280], [290, 250])
    .curveTo (pathFrom, [220, 220]);

var ctx = canvasElem
    .getContext ('2d-libcanvas')
    .set ({
    'fillStyle': 'red',
    'strokeStyle': 'black'
});
// Fill in the red polygon in the context
path.draw (ctx, 'fill');
// Circle the black polygon in context
path.draw (ctx, 'stroke');
```

But this method is recommended to be used only if for some reason the following is not available:

```js
var ctx = canvasElem
    .getContext ('2d-libcanvas')
    .fill (path, 'red')
    .stroke (path, 'black');
```

#### Returns `this`

## The processPath method

```js
Path processPath (LibCanvas.Context2D ctx, bool noWrap = false)
```

Passes the path using `ctx.moveTo`, `ctx.lineTo`, `ctx.curveTo`

#### the argument `noWrap`
if specified in false (by default), then frames with `beginPath`, `endPath`

#### Example

```js
path = new Path ()
    .moveTo ([150, 200])
    .curveTo ([300, 200], [250, 150])
    .curveTo ([200, 280], [290, 250])
    .curveTo ([150, 200], [220, 220])
    .processPath (ctx);

// is equivalent to:

ctx.beginPath ()
    .moveTo ([150, 200])
    .curveTo ([300, 200], [250, 150])
    .curveTo ([200, 280], [290, 250])
    .curveTo ([150, 200], [220, 220])
    .closePath ();
```

## The clone method

```js
Path clone ()
```

Returns a new path with declined dots

#### Example

```js
path = new Path ()
    .moveTo ([150, 200])
    .curveTo ([300, 200], [250, 150])
    .curveTo ([200, 280], [290, 250])
    .curveTo ([150, 200], [220, 220]);

var pathClone = path.clone ();
```

Attention! If in the original path several points refer to one object, then in the new path, the clone, these will be different, unrelated points objects.