Engines.Tile.Engine.Element
===========================

`TileEngine.Element` is a bridge for communication `TileEngine` and `LibCanvas.App`.
It is necessary for embedding the tile engine in `LibCanvas.App` and signing on mouse events.

### Initialization

```js
new TileEngine.Element (App.Layer layer, object settings)
```

Settings can contain the following parameters:

* `engine` (* TileEngine *) - required parameter, link to the tile engine
* `from` (* LibCanvas.Point *) - optional parameter, displacement of the drawing

```js
var engineElement = new TileEngine.Element (
    app.createLayer ('tile-engine'),
    {engine: engine}
)
```

It is not necessary to add to the layer with the tile engine any other elements - rendering may not be correct.

### TileEngine.Element.app

```js
TileEngine.Element.app (App app, TileEngine engine, Point from = null)
```

Used for more simple applications - creates the correct layer in `LibCanvas.App`, creates and adds an element to the layer, returns this element.
In fact, it's just a shortened record for creating an element and a layer for it.

```js
var engineElement = TileEngine.Element.app (app, engine)
```