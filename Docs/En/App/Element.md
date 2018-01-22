LibCanvas.App.Element
=====================

`LibCanvas.App.Element` - abstract class-framework for creating elements that will be drawn

Unlike other LibCanvas classes, this is used exclusively through inheritance.
Our tool is to override it and create our own methods in the class of the heir:

```js

atom.declare ('Unit', App.Element, {
    renderTo: function (ctx, resources) {
      ctx.fill (this.shape, 'red');
    }
});

new Unit (layer, {
  shape: new Circle (100, 100, 50)
});

```

### Built-in methods and properties

`atom.Events events` - an object that listens to events
`atom.Settings settings` is an object with settings. Basic properties:
* `zIndex` - the order in which the element is rendered
* `shape` is a shape that indicates an element
* `hidden` (* boolean *) - hides or displays an element. Hiding via `hidden` is preferable to just empty rendering, because then the element does not participate in the miscalculation of collisions and its previous location is not erased.

#### `redraw`

`LibCanvas.App.Element redraw ()`

A method that tells the application that the item has changed.
Attention! The method itself does not redraw anything, it just puts the element in the queue for rendering.
The call element is very fast and can be repeated painlessly many times per frame
The method context is bound to the element, so that it can be passed as a collab without losing the context

```js
animate (element, {
    color: 'red',
    onChange: element.redraw
})
```

#### `destroy`

`LibCanvas.App.Element destroy ()`

Removes an element from the context (but does not untie mouse events if you were signed via mouseHandler!)
The method context is bound to the element, so that it can be passed as a collab without losing the context

```js
destroyButton.onclick = element.destroy;
```

### Methods to Override

#### renderTo

```js
void renderTo (LibCanvas.Context2D ctx, atom.Registry resources)
```

Render element in the context. Describe in this method only renderer, but not object changes!
By implication, calls the renderTo method of the renderer property if there is or nothing does

```js

atom.declare ('Unit', App.Element, {
    renderTo: function (ctx, resources) {
        ctx.fill (this.shape, 'red');
        ctx.stroke (this.shape, 'blue');
    }
});

```

#### configure

```js
void configure ()
```

Called immediately after construction. Used in the successors of `App.Element` instead of the constructor

#### get currentBoundingShape

Getter, which returns a figure describing the effect of an element on the context. By default - a rectangle, in which is enclosed the `shape` element

#### isTriggerPoint

```js
boolean isTriggerPoint (Point point)
```

Determines whether the point is a trigger point for a mouse or other input device. In an instinctive way - it checks for belonging to `shape`

#### onUpdate

```js
void onUpdate (int time)
```

If the layer has an invoke, each frame is called and serves to change the properties of the object according to the time.
In the argument `time`, the time in milliseconds passed from the last frame is transmitted to correct and unbind the speed of the application from the FPS

```js

atom.declare ('Unit', App.Element, {
    onUpdate: function (time) {
        // rotate at 90 degrees per second
        this.rotate ((90) .degree () * time / 1000);
        
        // since changes occur every frame - always cause the drawing
        this.redraw ();
    }
});
```

#### clearPrevious

```js
void clearPrevious (LibCanvas.Context2D ctx)
```

Clears the previous location of the element in ctx. By default - erases `this.previousBoundingShape`

#### distanceMove

```js
void distanceMove (LibCanvas.Point point)
```

Shifts the element to the `point` distance. Used, for example, in `App.Draggable`.