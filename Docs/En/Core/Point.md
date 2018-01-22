LibCanvas.Point
===============

`LibCanvas.Point` is one of the bases in the LibCanvas library. It builds many calculations, simple figures, drawing the result.

#### Global

After calling LibCanvas.extract (), you can use the short alias "Point"

## Creating an instance of LibCanvas.Point
You can create an instance of the class `LibCanvas.Point` in one of the following ways:

```js
var xCoord = 15, yCoord = 20;

// passing coordinates to the constructor
var point = new LibCanvas.Point (xCoord, yCoord);

// array of coordinates
var point = new LibCanvas.Point ([xCoord, yCoord]);

// coordinate object
var point = new LibCanvas.Point ({x: xCoord, y: yCoord});

// Another LibCanvas.Point object
var point = new LibCanvas.Point (anotherPoint);

// which is equivalent to
var point = anotherPoint.clone ();

// after using LibCanvas.extract ():
var point = new Point (xCoord, yCoord);
```

## The equals method

```js
boolean equals (LibCanvas.Point to, int accuracy)
```

The method compares two points not by reference

#### argument `accuracy`

If specified, it means the number of characters, with the accuracy of which the points will be compared (for inaccurate comparison)

#### Example

```js
var bar = new LibCanvas.Point (15, 15);
var foo = new LibCanvas.Point (15, 15);

trace (bar == foo); // false
trace (bar.equals (foo)); // true
```

#### Example of accuracy

```js
var bar = new LibCanvas.Point (12.88888324, 15.1111127);
var foo = new LibCanvas.Point (12.88888115, 15.1111093);

console.log (bar == foo); // false
console.log (bar.equals (foo)); // false
console.log (bar.equals (foo, 8)); // false
console.log (bar.equals (foo, 4)); // true
```

## The clone method

```js
LibCanvas.Point clone ()
```

Returns a point with the same coordinates

#### Example

```js
var point = new LibCanvas.Point (15, 15);
var clone = point.clone ();
console.log (point == clone); // false
console.log (point.equals (clone)); // true
```

## The move method

```js
LibCanvas.Point move (LibCanvas.Point distance, boolean reverse = false)
```

#### Example

```js
var point = new LibCanvas.Point (10, 10);
var distance = new LibCanvas.Point (5, -3);

point.move (distance, false); // Point (15, 7)
point.move (distance, true); // Point (5, 13)
```

#### Returns `this`

## moveTo

```js
LibCanvas.Point moveTo (LibCanvas.Point point)
```

#### Example

```js
var start = new LibCanvas.Point (100, 100);
var finish = new LibCanvas.Point (800, 800);
// just move point to end
start.moveTo (finish);
```

#### Returns `this`

## angleTo method

```js
int angleTo (LibCanvas.Point point)
```

#### Example

```js
var pO = new LibCanvas.Point (10, 10);
var pA = new LibCanvas.Point (15, 15);

var angle = pA.angleTo (pO); // 0.785 (in radians)
angle.getDegree () == 45; // in degrees
```

## DistanceTo method

```js
int distanceTo (LibCanvas.Point point)
```

#### Example

```js
var pO = new LibCanvas.Point (10, 10);
var pA = new LibCanvas.Point (15, 15);

pA.distanceTo (pO); // 7.071
```

## diff

```js
LibCanvas.Point diff (LibCanvas.Point point)
```

This method means roughly the following:
how much you need to move the point, so that it is in place of the one that is passed by the first argument

#### Example

```js
var pO = new LibCanvas.Point (10, 10);
var pA = new LibCanvas.Point (15, 18);

pA.diff (pO); // Point (-5, -8)
```

## Rotate method

```js
LibCanvas.Point rotate (int angle, LibCanvas.Point pivot = {x: 0, y: 0})
```

Undo a point by angle degrees around the axis pivot

#### Example

```js
var pO = new LibCanvas.Point (10, 10);
var pA = new LibCanvas.Point (20, 10);

pA.rotate ((90) .degree (), pO); // Point (10, 20)
```

#### Returns `this`

## Method scale

```js
LibCanvas.Point scale (int power, LibCanvas.Point pivot = Point (0, 0))
```

Increases the distance from the `pivot` point in `power` times

#### Example

```js
var pO = new LibCanvas.Point (10, 10);
var pA = new LibCanvas.Point (20, 15);
pA.scale (2, pO); // Point (30, 20)
```

#### Returns `this`

## Method getNeighbour

```js
LibCanvas.Point scale (string direction)
```

Returns the next point.

#### argument `direction`
can take one of the following values:

`t` - returns a point from the top

`r` - returns the point to the right

`b` - returns a point from below

`l` - returns a point on the left

`tl` - returns a point from top to left

`tr` - returns a point from the top to the right

`bl` - returns a point from the bottom to the left

`br` - returns a point from the bottom to the right

#### Example

```js
var pA = new LibCanvas.Point (15, 15);
pA.getNeighbor ('t'); // Point (15, 14)
pA.getNeighbour ('bl'); // Point (14, 16)
```

## ToObject Method

```js
Object toObject ()
```

Returns a hash with the coordinates of the point

#### Example

```js
var bar = new LibCanvas.Point (12, 15);
var foo = bar.toObject ();
// similar to foo = {x: 12, y: 15}
```

## method checkDistanceTo

```js
boolean checkDistanceTo (Point point, number distance, boolean equals = false)
```

Checks that the distance to the point is less than `distance` or is equal to, if `equals = true`.
The method is a faster analogue of the verification via `distanceTo`:

#### Example

```js
// Distance is 5
var foo = new LibCanvas.Point (12, 15);
var bar = new LibCanvas.Point (16, 18);

// Strict check
foo.checkDistanceTo (bar, 5); // false
// analog:
foo.distanceTo (bar) <5 // false

// Nondestructive check
foo.checkDistanceTo (bar, 5, true); // false
// analog:
foo.distanceTo (bar) <= 5 // true
```