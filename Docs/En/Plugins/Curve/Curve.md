Plugins.Curve
=============

The mathematical basis for the Bezier Curves. Can be used to create motion animations along the way and for other purposes.

### Initialization

```js
// Quadratic curve, one control point
var curve = new LibCanvas.Plugins.Curve ({
    from: new Point (100, 100),
    to: new Point (200, 300),
    points: [
        new Point (200, 100)
    ]
});

// Qubic curve, two control points
var curve = new LibCanvas.Plugins.Curve ({
    from: new Point (100, 100),
    to: new Point (200, 300),
    points: [
        new Point (200, 100),
        new Point (100, 200),
    ]
});
```

* `from` (* LibCanvas.Point *) - the starting point of the curve
* `to` (* LibCanvas.Point *) - the end point of the curve
* `points` (* LibCanvas.Point [] *) - an array of control points of the curve

### Methods

#### getPoint

```js
LibCanvas.Point getPoint (float t)
```

`t` is a number between 0 and 1. Returns the coordinates of a point of a line.


```js
var point = curve.getPoint (0.45)
```


#### getAngle

```js
float getAngle (float t)
```

`t` is a number between 0 and 1. Returns the angle of the curve at the appropriate place


```js
var angle = curve.getAngle (0.45)
```