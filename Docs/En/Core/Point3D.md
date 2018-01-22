LibCanvas.Point3D
=================

`LibCanvas.Point3D` is a class that describes a point in three-dimensional space.

#### Global

After calling LibCanvas.extract (), you can use the short alias "Point3D"

## Creating an instance of LibCanvas.Point3D


You can create an instance of the class `LibCanvas.Point` in one of the following ways:

```js
var xCoord = 15, yCoord = 20, zCoord = 25;

// passing coordinates to the constructor
var point = new LibCanvas.Point3D (xCoord, yCoord, zCoord);

// array of coordinates
var point = new LibCanvas.Point3D ([xCoord, yCoord, zCoord]);

// coordinate object
var point = new LibCanvas.Point3D ({x: xCoord, y: yCoord, z: zCoord});

// Another LibCanvas.Point3D object
var point = new LibCanvas.Point3D (anotherPoint);

// which is equivalent to
var point = anotherPoint.clone ();

// after using LibCanvas.extract ():
var point = new Point3D (xCoord, yCoord, zCoord);
```

## The equals method

```js
boolean equals (LibCanvas.Point3D to, int accuracy)
```

The method compares two points not by reference

#### argument `accuracy`

If specified, it means the number of characters, with the accuracy of which the points will be compared (for inaccurate comparison)

#### Example

```js
var bar = new LibCanvas.Point3D (15, 15, 10);
var foo = new LibCanvas.Point3D (15, 15, 10);

trace (bar == foo); // false
trace (bar.equals (foo)); // true
```

#### Example of accuracy

```js
var bar = new LibCanvas.Point3D (7, 12.88888324, 15.1111127);
var foo = new LibCanvas.Point3D (7, 12.88888115, 15.1111093);

console.log (bar == foo); // false
console.log (bar.equals (foo)); // false
console.log (bar.equals (foo, 8)); // false
console.log (bar.equals (foo, 4)); // true
```

## The clone method

```js
LibCanvas.Point3D clone ()
```

Returns a point with the same coordinates

#### Example

```js
var point = new LibCanvas.Point3D (15, 15, 10);
var clone = point.clone ();
console.log (point == clone); // false
console.log (point.equals (clone)); // true
```

## The move method

```js
LibCanvas.Point move (LibCanvas.Point point3d)
```

#### Example

```js
var point = new LibCanvas.Point3D (10, 10, 10);
var distance = new LibCanvas.Point3D (5, -3, 1);

point.move (distance); // Point3D (15, 7, 11)
```

## diff

```js
LibCanvas.Point3D diff (LibCanvas.Point3D point)
```

This method means roughly the following:
how much you need to move the point, so that it is in place of the one that is passed by the first argument

#### Example

```js
var pO = new LibCanvas.Point3D (10, 10, 7);
var pA = new LibCanvas.Point3D (15, 18, 7);

pA.diff (pO); // Point3D (-5, -8, 0)
```

## The map method

```js
LibCanvas.Point3D map (callback, context)
```

Changes the point values ​​according to the callback result

#### Example

```js
var point = new LibCanvas.Point3D (1, 2, 3);

point.map (function (value, coord, point) {
    return value * value;
});

atom.trace (point); // Point3D (1, 4, 9)
```

## The add method

```js
LibCanvas.Point3D add (value)
```

Increase the value of all the coordinates of the point on `value`

#### Example

```js
var point = new LibCanvas.Point3D (1, 2, 3);

point.add (5);

atom.trace (point); // Point3D (6, 7, 8)
```

## The mul method

```js
LibCanvas.Point3D mul (value)
```

Multiply the value of all point coordinates by `value`

#### Example

```js
var point = new LibCanvas.Point3D (1, 2, 3);

point.mul (5);

atom.trace (point); // Point3D (5, 10, 15)
```