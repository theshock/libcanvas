LibCanvas.Context2D
===================

`LibCanvas.Context2D` is a considerably extended standard 2d-context, which can be obtained as follows:

```js
var context = canvas.getContext ('2d-libcanvas');
// alternate syntax:
var context = new LibCanvas.Context2D (canvas);
```

His main idea is all methods, if there is no other need to return a context reference for use in the chains of calls, the possibility of using named arguments and the use of LibCanvas objects.

In addition, it provides many non-standard methods.

#### Global

After calling LibCanvas.extract (), you can use the short alias "Context2D"

## Properties

### canvas (get)
Reference to parent dom-element

### width (get / set)
Returns / changes the width of the canvas

### height (get / set)
Returns / changes the height of the canvas

### size (get / set)
Returns / changes the height of the canvas

```js
context.size = new Size (400, 250);
```

### rectangle (get)
Returns a reference to a rectangle that matches the canvas dimensions
It is highly not recommended to work directly with this object. If necessary, use a clone.

#### Example

```js
if (context.rectangle.hasPoint (somePoint)) {
    // The point is within the canvas
    doSmth ();
}

// Change the Rectangle
var clone = context.rectangle.clone ();

clone.height /= 2;
clone.width /= 2;

context.fillAll (clone, 'red');
```

### shadow (get / set)
Allows you to get / set the shadowOffsetX, shadowOffsetY, shadowBlur, and shadowColor properties in a laconic way

#### Example

```js
context.shadow = '1 2 3 black';

// Analog:
context.shadowOffsetX = 1;
context.shadowOffsetY = 2;
context.shadowBlur = 3;
context.shadowColor = 'black';
```

## The getClone method

```js
HTMLCanvasElement getClone (int width, int height)
```

Returns a canvas that is equal to the image and with the resized size, if width and height are specified
It can be used to create a copy of the current layer, a small icon, etc.

#### Example

```js
context.drawImage (context.getClone (64, 48));
```

## set method

```js
[this] set (object properties)
[this] set (string propertyName, string propertyValue)
```

Specifies the canvas properties

#### Example

```js
context
.set ({
    fillStyle: 'black',
    strokeStyle: 'blue'
})
.set ('globalOpacity', 0.5);
```

## The get method

```js
string get (string propertyName)
```

Get property values

#### Example

```js
context.get ('fillStyle');
```

## The fillAll method

```js
[this] fillAll ()
[this] fillAll (string fillStyle)
```

Fills the entire canvas with fillStyle color or default color, if no argument is passed

#### Example

```js
context.fillAll ('red');
```

## The strokeAll method

```js
[this] strokeAll ()
[this] strokeAll (string strokeStyle)
```

Draws the whole canvas with strokeStyle color or default color, if no argument is passed

#### Example

```js
context.strokeAll ('rgb (255, 245, 200)');
```

## The clearAll method

```js
[this] clearAll ()
```

Cleans the canvas

#### Example

```js
context.clearAll ();
```

## The fill method

```js
[this] fill ()
[this] fill (string fillStyle)
[this] fill (Shape shape)
[this] fill (Shape shape, string fillStyle)
```

Fills the shape or current path with fillStyle color or default color, if no argument is passed

#### Example

```js
context.fill (new Circle (50, 50, 20), 'red');
```

## Method stroke

```js
[this] stroke ()
[this] stroke (string fillStyle)
[this] stroke (Shape shape)
[this] stroke (Shape shape, string fillStyle)
```

Draws a shape or current path with strokeStyle color or default color, if no argument is passed

#### Example

```js
context.stroke (new Circle (50, 50, 20), 'red');
```

## Method clear

```js
[this] clear (Shape shape)
```

Clears the shape passed by the first argument. (anti-aliasing - off!)

## The fillRect method

```js
[this] fillRect (LibCanvas.Shapes.Rectangle rectangle)
[this] fillRect (int fromX, int fromY, int width, int height)
```

## The strokeRect method

```js
[this] strokeRect (LibCanvas.Shapes.Rectangle rectangle)
[this] strokeRect (int fromX, int fromY, int width, int height)
```

## The clearRect method

```js
[this] clearRect (LibCanvas.Shapes.Rectangle rectangle)
[this] clearRect (int fromX, int fromY, int width, int height)
```

#### Example

```js
context.clear (new Circle (50, 50, 20));
```

## Methods save / restore

```js
[this] save ()
```

Saves the canvas settings to the stack

```js
[this] restore ()
```

Restores the last saved canvas settings

#### Example

```js
context.set ({fillStyle: 'blue'});
context.save ();
context.set ({fillStyle: 'red'});
context.fillAll (); // fill everything in red
context.restore ();
context.fillAll (); // fill everything in blue
```

# Create a path

## The beginPath method

```js
[this] beginPath ()
[this] beginPath (point)
[this] beginPath (int x, int y)
```

Opens the path. If there are arguments, it calls the `moveTo` method

## The closePath method

```js
[this] closePath ()
[this] closePath (LibCanvas.Point point)
[this] closePath (int x, int y)
```

Closes the path. If there are arguments, it calls the `lineTo` method

## moveTo

```js
[this] moveTo (LibCanvas.Point point);
[this] moveTo (int x, int y);
```

Moves the path pointer to the point

## The lineTo method

```js
[this] lineTo (LibCanvas.Point point);
[this] lineTo (int x, int y);
```

Puts the line to the point

## Method arc

```js
[this] lineTo (object params);
```

Make an arc

#### Options

`circle` (* LibCanvas.Shapes.Circle *) - the circle on which you want to draw an arc

`angle` (* object *) is the angle that the arc draws. Two of three parameters are required:

* `start` (* int *) - where the arc begins (in radians)
* `end` (* int *) - where the arc ends (in radians)
* `size` (* int *) - the size of the arc (in radians)

If an array of two elements is transferred, it is assumed that the first is start, and the second is end

`anticlockwise` or `acw` - if specified in true, then the direction of movement is counter-clockwise

#### Example

```js
context.arc ({
    circle: new LibCanvas.Shapes.Circle (50, 50, 25),
    angle: [(30) .degree (), (60) .degree ()]
});
```

## The curveTo method

```js
[this] curveTo (object params);
```

Draws the Bezier curve on the control points.

#### Options

`to` (* LibCanvas.Point *) - where to plot the curve

`point` (* LibCanvas.Point [] *) - an array of control points. Maybe two, one or not.

#### Example

```js
context.curveTo ({
    to: [100, 100],
    points: [
        [80, 30],
        [20, 90]
    ]
});
```
// is equivalent to

```js
context.bezierCurveTo (80, 30, 20, 90, 100, 100);
```

## The isPointInPath method

```js
boolean isPointInPath (LibCanvas.Point point);
boolean isPointInPath (int x, int y);
```

Checks if the given point is within the painted path

#### Example

```js
context.isPointInPath ([15, 20]);
```

## The clip method

```js
[this] clip ();
[this] clip (LibCanvas.Shape shape);
```

Limits drawing to canvas by a certain area.
If the `shape` argument is not passed, the current path will be used

#### Example

```js
// everything outside the circle will not be reflected
context.clip (new Circle (100, 100, 50));
context.fillRect (100, 100, 100, 100);
```

## Rotate method

```js
[this] rotate (number angle);
[this] rotate (number angle, LibCanvas.Point pivot);
```

## The translate method

```js
[this] translate (LibCanvas.Point point)
[this] translate (LibCanvas.Point point, boolean reverse)
[this] translate (int x, int y)
```

## Method text

```js
[this] text (object params)
```

#### Options

`text` (* string *)

`color` (* string *)

`stroke` (* bool, default = false *) if the parameter = true, then canvas.fillStyle () calls canvas.strokeStyle,
that is, the "text stroke" mode is turned on, while the text itself remains transparent. If you want to draw text,
and stroke the text, you must first call the text method with stroke = true, and then again with stroke = false.

`lineWidth` (* int *) specifies the thickness of the stroke stroke line for stroke = true, while carefully checking
result - some browsers render strokes of complex letters (w, m, n, etc) with artifacts and, probably, have to play
with stroke width / text size

`wrap` (* string *) no | normal

`to` (* LibCanvas.Shapes.Rectangle *) by default calls this.getFullRectangle

`align` (* string *) center | left | right

`size` (* int, default = 16 *)

`weight` (* string *) bold | normal

`style` (* string *) italic | normal

`family` (* string *, default = sans-serif)

`lineHeight` (* int *)

`overflow` (* string *, default = visible) hidden | visible

`padding` (* int | int [] *, default = 0) [topBottom, leftRight]

`shadow` (* string *) turns on the mode of shadow rendering for text. The format is as in canvas: `` shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor'.
For example: `shadow: '0 -1 3 # 616161'`. Do not forget to specify the color with the '#' character, Chrome will show it, but there are no other browsers :).

## The drawImage method

```js
[this] drawImage (element image)
[this] drawImage (object params)
```

#### Options

Only one of the `from`, `center`, `draw` options is required

`image` (* element *) the image you are about to draw

`from` (* LibCanvas.Point *) is the top left point from which to draw the picture

`center` (* LibCanvas.Point *) is the center point from which to draw the picture

`draw` (* LibCanvas.Shapes.Rectangle *) The rectangle in which to draw the picture. The image is scaled to the size of the polygon.

`crop` (* LibCanvas.Shapes.Rectangle *) is a rectangle that points to the part of the image you want to cut (applies only when using draw)

`angle` (* int *) the angle of the picture in radians

`scale` (* LibCanvas.Point *) resize the picture. Can be used to reflect images vertically or horizontally

The principle is simple - if there is a `draw` and `crop`, then `crop` to the picture is first applied, then it is placed according to `from | center | draw`, then it rotates around the center at an angle angle clockwise and so is drawn.

#### Example

```js
context.drawImage ({
    image: this.image,
    center: this.position,
    angle: this.angle
});

context.drawImage ({
    image: canvas,
    crop: [100, 100, 50, 50],
    draw: [250, 250, 50, 50]
});

context.drawImage ({
    image: this.image,
    from: this.from,
    scale: new Point (-1, 1) // flipX
});
```

## ProjectiveImage method
###### testing

```js
[this] projectiveImage (object params)
```

## The getPixel method

```js
[this] getPixel (LibCanvas.Point point)
```

Returns the pixel color value at the point point in the format {r: [0, 255], g: [0, 255], b: [0, 255], a: [0, 1]}
You can pass the argument to the Color constructor.

#### Example

```js
mouse.events.add ('click', function () {
    var pixel = ctx.getPixel (mouse.point);
    trace (new atom.Color (pixel));
});

mouse.events.add ('click', function () {
    var pixel = ctx.getPixel (mouse.point);
    
    pixel.a> 0.1?
    alert ('Pixel is visible'):
    alert ('Pixel is invisible');
});
```

## The createGradient method

```js
[RadialGradient] createGradient (Circle from, Circle to, Object colors)
[LinearGradient] createGradient (Point from, Point to, Object colors)
[LinearGradient] createGradient (Rectangle rect, Object colors)
```

Creates and returns a radial or linear gradient with the stop colors specified in colors

```js
context.createGradient (context.rectangle, {
    '0.0': 'red',
    '0.5': 'blue',
    '1.0': 'green'
});

context.createGradient (
    new Circle (50, 50, 10),
    new Circle (50, 50, 20), {
    '0.0': 'red',
    '0.5': 'blue',
    '1.0': 'green'
});
```

## The createRectangleGradient method

//// todo

# The following methods repeat the methods from the original context:
 * scale
 * transform
 * setTransform
 * fillText
 * strokeText
 * measureText
 * createImageData
 * putImageData
 * getImageData
 * getPixels
 * createLinearGradient
 * createRadialGradient
 * createPattern
 * drawWindow