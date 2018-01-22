Engines.Hex.Isometric
=====================

Library for working with isometric projection of 3d coordinates.

#### Global

After calling LibCanvas.extract (), you can use the short alias "IsometricEngine"

IsometricEngine.Projection
==========================

It is an easy possibility to translate coordinates from 3d-coordinates in space into isometric 2d-coordinates and back.

#### Coordinates

Coordinates are broadcast very simply. A positive shift along the X axis shifts the point up and to the right, and a positive shift along the Y axis - down-right. A positive shift along the Z axis moves the point exactly upwards.

! [Isometric map] (https://raw.github.com/theshock/libcanvas/master/Docs/Ru/Engines/Isometric/iso.png)

#### The pixel size

There are different approaches to the transformation of pixels. Correct isometric projection requires an angle of 30 degrees, but often in computer games a more acute angle is used, so that the cell's proportions are 2: 1. The value of "factor" corresponds to this value:

```js
factor: new Point3D (0.866, 0.5, 0.866) // the correct projection
factor: new Point3D (1, 0.5, 1) // proportional projection
```

The first value is responsible for the width of the pixel in the X coordinate, the second - for the width of the pixel in the Y coordinate, the third - for the height of the Z coordinate.

You can also proportionally change the pixel by setting the `size`

The `start` option is required to specify the start coordinates (where the pixel [0; 0; 0] is located).

Example:

```js
var projection = new IsometricEngine.Projection ({
    factor: new Point3D (1, 0.5, 1), // the map will be proportional
    size: 2, // increment the pixels twice
    start: new Point (100, 100) // the grid begins with a slight indent
});
```

### Methods

#### toIsometric

```js
Point toIsometric (Point3D point3d)
```

Translates the coordinates of a point from three-dimensional in space to two-dimensional on the screen. Used, for example, when drawing.

```js
var playersCoord = [
    new Point3D (100, 50, 10),
    new Point3D (80, 20, 0),
    new Point3D (20, 130, 4)
];

playersCoord.forEach (function (coord3d) {
    ctx.fill (new Circle (
        projection.toIsometric (coord3d), 10
    ));
});
```

#### to3D

```js
Point3D to3D (Point point3d [, int z = 0])
```

Translates the coordinates of a point from two-dimensional on the screen into three-dimensional in space. Can be used to determine the coordinate of the field when the mouse is clicked. Because it is impossible to determine at what height the current point is located - you can use an optional argument.

```js
mouse.events.add ('click', function (e) {
    var mapCoord = projection.to3d (mouse.point);
    
    atom.trace (mapCoord);
});
```

#### Example

```js
atom.dom (function () {
    function point (x, y, z) {
        return projection.toIsometric (new Point3D (x, y, z));
    }

    function createColor (x, y) {
        // Color will be calculated dynamically
        // atom.Color will make sure that we do not get out of bounds
        // If you move along the X axis, the cell will be redder
        // If you move along the Y axis, the cell will be less green
        // As the difference between X and Y increases, the cell will lose its blue
        // Bottom line: left cell - green, right - pink, bottom - blue, upper - yellow
        return new atom.Color (128 + 24 * x, 255 - 24 * y, 128-24 * (x-y)). toString ();
    }

    function drawPoly (x, y) {
        // create a polygon from 4 neighboring points. The height in the example is always zero
        var poly = new Polygon (
            point (x + 0, y + 0,0),
            point (x + 0, y + 1.0),
            point (x + 1, y + 1.0),
            point (x + 1, y + 0,0)
        );
    
        buffer.ctx
        .fill (poly, createColor (x, y))
        .stroke (poly);
        
        buffer.ctx.fillText (x + '/' + y, poly.center);
    }

    function drawMap (width, height) {
        var x, y;
        for (x = 0; x <width; x ++) for (y = 0; y <height; y ++) {
            drawPoly (x, y);
        }
    }

    var buffer, x, y, projection;
    
    LibCanvas.extract ();
    
    // Create the canvas on which we will draw the map
    buffer = LibCanvas.buffer (800, 480, true);
    // Add it to our screen
    atom.dom (buffer) .appendTo ('body');
    // Basic setting of the canvas - fill in the background and specify the styles
    buffer.ctx
    .fillAll ('# eee')
    .set ({
        fillStyle: 'black',
        strokeStyle: '# 777',
        textAlign: 'center',
        textBaseline: 'middle',
        font: '14px monospace'
    });
    
    // create a projection, the pixel size will be increased 60 times
    projection = new IsometricEngine.Projection ({
        start: new Point (40, 240),
        size: 60
    });
    // draw a 7 * 7 cell map
    drawMap (7, 7);
});
```

! [Result of the code execution] (https://raw.github.com/theshock/libcanvas/master/Docs/Ru/Engines/Isometric/iso-result.png)