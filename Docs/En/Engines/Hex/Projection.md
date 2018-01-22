Engines.Hex.Projection
=====================

Provides an easy way to transform rgb-hex coordinates into 2-d coordinates and back.
Note that rgb-coordinates for hex-grid representation are a powerful, unambiguous and fast solution.
At first it may seem less familiar than usual x-y coordinates, but after work everything will change.

#### Coordinates

When navigating the map, the coordinates change as follows:

* `g + 1, b-1` - go up
* `g-1, b + 1` - down
* `r-1, g + 1` - left-up
* `r-1, b + 1` - left-down
* `r + 1, b-1` - right-up
* `r + 1, g-1` - right-down

The basic rule is that the sum of the three coordinates must be zero, that is:

```js
r + g + b = 0
```

! [Example of a grid of coordinates] (https://raw.github.com/theshock/libcanvas/master/Docs/Ru/Engines/Hex/hex-coords.png)

#### Cell Size

The size of each hex is given by three parameters:

* `baseLength` - width of the main side
* `hexHeight` - hex height
* `chordLength` - width of the side triangle

! [Hex dimensions] (https://raw.github.com/theshock/libcanvas/master/Docs/Ru/Engines/Hex/hex-sizes.png)

If it is necessary to obtain an equilateral hex with a side length K, we get the following values:

```js
baseLength = K
chordLength = K * sin (30) = K / 2
hexHeight = K * cos (30) * 2 = K * 1.732
```

For example:

```js
baseLength = 56
chordLength = 28
hexHeight = 97
```

#### Global

After calling LibCanvas.extract (), you can use the short alias "HexEngine.Projection"

### Initialization

```js
var projection = new HexEngine.Projection (object settings)
```

Settings can contain the following parameters:

* Dimensions of hex (described above):
* `baseLength`
* `chordLength`
* `hexHeight`
* `start` - the point to be considered as the center of the hex [0: 0: 0]

If `chordLength == null` or `hexHeight == null`, then they are computed from `baseLength` to create an equilateral polygon.

### Methods

#### isZero

```js
bool isZero (int [] coordinates)
```

Checks whether coordinates are coordinates of the central hex ([0,0,0])

```js
projection.isZero ([0, 0, 0]); // true
projection.isZero ([- 1, -1, 2]); // false
```

#### rgbToPoint

```js
Point rgbToPoint (int [] coordinates)
```

Returns the center of the hex from the array of its rgb-coordinates. Can be used, for example, to place a unit on the center of the hex on the canvas

```js
var center = projection.rgbToPoint ([0, 0, 0]);
var center = projection.rgbToPoint ([5, 2, -7]);
```


#### pointToRgb

```js
int [] rgbToPoint (Point point)
```

Returns the rgb-coordinates of the hex according to the point `point`. The point can be anywhere in the hex, not necessarily in the center. It can be used, for example, to find out over which hex the mouse is located:

```js
var coordArray = projection.pointToRgb (new Point (100, 50));

// Track which hex the mouse is on:
var trace = atom.trace ();

mouse.events.add ('move', function () {
trace.value = projection.pointToRgb (mouse.point);
});
```

#### createPolygon

```js
Polygon createPolygon (Point center)
```

Returns a polygon of six points that describes the hex. Can be used for vector rendering of hex on the canvas:

```js
var centerPoint = projection.rgbToPoint ([1, -1, 0]);
var polygon = projection.createPolygon (centerPolygon);

ctx.fill (polygon, 'white');
ctx.stroke (polygon, 'black');
```

#### sizes

```js
HexEngine.Projection.Sizes sizes (Number padding = 0);
```

Returns the object `HexEngine.Projection.Sizes`

```js
var sizes = projection.sizes ();
```

HexEngine.Projection.Sizes
===========================

An object that is designed to determine the dimensions of a hexagonal map according to its parameters and hex coordinates. It is important that the map can be asymmetric. It is created only using the `HexProjection.Sizes # sizes` method.

```js
var sizes = projection.sizes ();
```

#### add

```js
HexEngine.Projection.Sizes add (int [] coordinates)
```

Adds coordinates to the map

```js
sizes
.add ([0, 0, 0])
.add ([1, -1, 0])
.add ([1, 0, -1])
.add ([-1, 1, 0])
.add ([-1, 0, 1])
.add ([0, 1, -1])
.add ([0, -1, 1])
.add ([0, -2, 2])
```

#### size

```js
Size size ()
```

Returns the size of the canvas needed to hold the map including the `padding` indents.

```js
var size = sizes.size ();
```

#### center

```js
Point center ()
```

Returns an arrangement of zero hex at which the map fits perfectly into the dimensions returned by the `size`

```js
var center = sizes.center ();
```

Sharing
========================

What if we need to create a canvas of minimal size, but at the same time, so that the hexagonal map fits into it exactly? It's very simple:

```js
// We have a list of hexes that need to be drawn:
var hexes = [
    [0, 0, 0],
    [1, -1, 0],
    [1, 0, -1],
    [-1, 1, 0],
    [-1, 0, 1],
    [0, 1, -1],
    [0, -1, 1],
    [0, -2, 2],
    [1, -2, 1],
    [2, -2, 0]
];

// create a projection of the required size, the center is not specified
var projection = new HexEngine.Projection ({
    baseLength: 40,
    chordLength: 20,
    hexHeight: 50
});

// Create a size object and add all hexes to it:
// The offset from the map boundaries will be 8
var sizes = projection.sizes (8);
hexes.forEach (function (coord) {
    sizes.add (coord);
});

// Now we can set the coordinates of the zero hex:
projection.settings.set ({start: sizes.center ()});

// Create a buffer of the required size, to which we will draw our hexes:
var buffer = LibCanvas.buffer (sizes.size (), true);

// Draw hexes:
hexes.forEach (function (coord) {
    var poly = projection.createPolygon (
        projection.rgbToPoint (coord)
    );

    // We want to see which hex is central
    var fillColor = projection.isZero (coord)
    ? 'white'
    : ['red', 'green', 'blue'].​​random
    
    buffer.ctx.fill (poly, fillColor);
    buffer.ctx.stroke (poly, 'white');
});

// display the buffer:
atom.dom (buffer) .appendTo ('body');
```