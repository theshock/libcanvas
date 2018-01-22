LibCanvas
=========

`LibCanvas` is a global object that is the root of the library namespace. It contains several static methods


## Static method extract

```js
object LibCanvas.extract (object to = window)
```

Allows you to extract some LibCanvas classes to the global namespace (or to a local object) for a shorter record

#### Example

```js
// Standard approach:
var circle = new LibCanvas.Shapes.Circle (100, 100, 20);

// Extract to local variable
var LC = LibCanvas.extract ({});
var circle = new LC.Circle (100, 100, 20);

// Extract to the global namespace:
LibCanvas.extract ();
var circle = new Circle (100, 100, 20);
```

## Static buffer

```js
canvasElement LibCanvas.buffer (int width, int height, bool withCtx)
canvasElement LibCanvas.buffer (LibCanvas.Size size, bool withCtx)
```

Creates and returns a Canvas element of size width * height.
If withCtx is true, then the element's `ctx` property will be equal to the context '2d-libcanvas'


#### Example

```js
var buffer = LibCanvas.buffer (100, 100, true);
buffer.ctx.fillAll ('black');

libcanvas.ctx.drawImage (buffer, 10, 10);
```