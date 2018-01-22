Engines.Tile.Engine.Mouse
=========================

`TileEngine.Mouse` is a special handler for optimized mouse processing with the help of delegation instead of signing each cell to its events.

### Initialization

```js
new TileEngine.Mouse (TileEngine.Element element, LibCanvas.Mouse mouse)
```

It is important to remember that the `element` must be pre-subscribed to mouse events using the `App.MouseHandler`

### Developments

* `over` - the mouse is in the cell
* `out` - the mouse is removed from the cell
* `down` - the mouse is pressed on the cell
* `up` - the mouse is pressed on the cell
* `click` - `down` and `up` worked on one cell
* `contextmenu` - the context menu is called above the cell

In all events, the first argument is passed to the cell that triggered the event.


#### Complete example

```js
element = TileEngine.Element.app (app, engine);

mouse = new Mouse (app.container.bounds);

new App.MouseHandler ({mouse: mouse, app: app})
.subscribe (element);

new TileEngine.Mouse (element, mouse) .events.add ({
    over: function (cell) {
        console.log ('mouse over', cell);
    },

    out: function (cell) {
        console.log ('mouse out of', cell);
    },
 
    click: function (cell) {
        console.log ('mouse click at', cell);
    }
});
```