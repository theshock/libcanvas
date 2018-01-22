LibCanvas.App.Layer
===================

`LibCanvas.App.Layer` - a class for creating layers of the LibCanvas application

### Initialization

It is created only with the help of the method `LibCanvas.App # createLayer`:

```js
LibCanvas.App.Layer app.createLayer (object settings);
```

Settings can contain the following parameters:

* `name` (* string *) - the name of the layer (needed only for debugging)
* `zIndex` (* number *) - z-index layer
* `invoke` (* boolean *) - is it necessary to call the `onUpdate` method on each object every frame (by default `false`)
* "intersection" - when redrawing one of the elements, it is necessary to redraw the rest. Values:
  * `auto` (by default) - only those necessary for correct rendering
  * `manual` - no, none (for example, when you want to personally manage the redrawing)
  * `all` - yes, all (for example, if it is cheaper than calculating all the intersections)
  * `full` - erase the entire canvas and draw everything from scratch

#### Example

```js
var layer = app.createLayer ({
    name: 'units',
    zIndex: 3,
    invoke: true,
    intersection: 'all'
})
```

#### Resizing the layer

Only the size of the specified layer will change. The size of the application and other layers will remain the same.
Remember that changing the size of the layer will destroy all the rendered data, so you need to call `layer.redrawAll ()`

```js
layer.dom.size = new Size (1500, 1200);
layer.redrawAll ()
```

### Properties

#### ctx

`2d-libcanvas` context of the canvas element of the layer

```js
layer.ctx.fillAll ('red')
```

### Methods

#### stop

```js
LibCanvas.App.Layer stop ()
```

Stop drawing layer

```js
layer.stop ()
```

#### start

```js
LibCanvas.App.Layer start ()
```

Resume layer rendering

```js
layer.start ()
```

#### hide

```js
LibCanvas.App.Layer hide ()
```

Temporarily hide the layer

```js
layer.hide ()
```

#### show

```js
LibCanvas.App.Layer show ()
```

Re-show layer

```js
layer.show ()
```

#### redrawAll

```js
LibCanvas.App.Layer redrawAll ()
```

Redraws all layer elements

```js
layer.redrawAll ()
```