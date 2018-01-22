Creating your own contexts
=========================

Improving the prototype HTMLCanvasElement makes it easy to create your own contexts with LibCanvas.
It is enough to call `HTMLCanvasElement.addContext (name, ContextClass)`, where `ContextClass` is a class with a constructor that takes the first argument to a link to the canvas element.

#### Example

```js
new function () {
    var ContextClass = atom.declare ({
        initialize: function (canvas) {
            this.canvas = canvas;
            this.ctx2d = canvas.getContext ('2d');
        },
        welcome: function () {
            this.ctx2d.fillText ('Hello World', 0, 0);
        }
    });
    
    HTMLCanvasElement.addContext ('2d-hello', ContextClass);
}
```

#### Usage:

```js
var myContext = canvas.getContext ('2d-hello');
myContext.welcome ();
myContext.fillRect (0, 0, 10, 10); // Error
```

The standard context methods are not implemented, so `fillRect` will return an error.
The easiest way to avoid this is to inherit from the context of LibCanvas.
Note - we inherited the constructor from the parent `LibCanvas.Context2D`, so it's enough to implement the methods.

#### Example

```js
new function () {
    var HelloContextClass = atom.declare (LibCanvas.Context2D, {
        welcome: function () {
            return this.ctx2d.fillText ('Hello World', 0, 0);
        }
    });

    HTMLCanvasElement.addContext ('2d-libcanvas-hello', HelloContextClass);
}
```

#### Usage:

```js
var myContext = canvas.getContext ('2d-libcanvas-hello');
myContext.welcome ();
myContext.fillRect (0, 0, 10, 10); // Success
```

It is desirable in the title to indicate the hierarchy of contexts in descending order, through a dash.

#### Canvas2DContext
You can use the plugin `Canvas2DContext` to create your own context on the basis of native (with the most similar interface)

```js
new function () {
    var HelloContextClass = atom.declare (LibCanvas.Canvas2DContext, {
        welcome: function () {
            return this.ctx2d.fillText ('Hello World', 0, 0);
        }
    });
    
    HTMLCanvasElement.addContext ('2d-hello', HelloContextClass);
}
```

#### Usage:

```js
var myContext = canvas.getContext ('2d-hello');
myContext.welcome ();
myContext.fillRect (0, 0, 10, 10); // Success
```

### Attention!
It is highly recommended not to override the built-in browser contexts (which you can still get through the `getOriginalContext` method), since this will bring very unexpected behavior to the application.
It is also not recommended to redefine the context of `2d-libcanvas`