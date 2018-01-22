Engines.Tile.Engine
===================

The basis of the tile engine. Responsible for building a matrix, storing drawing methods and is a factory of cells.

#### Global

After calling LibCanvas.extract (), you can use the short alias "TileEngine"

### Initialization

```js
var engine = new TileEngine (object settings)
```

Settings can contain the following parameters:

* `size` (* LibCanvas.Size *) - the size of the field in cells
* `cellSize` (* LibCanvas.Size *) - cell size in pixels
* `cellMargin` (* LibCanvas.Size *) - indents between cells
* `defaultValue` (* mixed *) - the default value for the cell

```js
engine = new TileEngine ({
    // A field of size 40 * 25 cells
    size: new Size (40, 25),
    // each cell size 10 * 10
    cellSize: new Size (10, 10),
    // indent between cells 1 pixel
    cellMargin: new Size (1, 1),
    // default value
    defaultValue: 'unknown'
})
```

### Properties

`get width` - the width of the field in cells
`get height` - the height of the field in cells
`get requireUpdate` - there are updates after the last cell refresh

### Methods

#### setMethod

```js
TileEngine setMethod (string name, Image value)
TileEngine setMethod (string name, function value)
TileEngine setMethod (string name, mixed value)
TileEngine setMethod (object methods)
```

Specifies the method of drawing for each cell value.

If the value is of type Image, then in the cell with the corresponding value, the picture will be drawn

If the value is of type function, then the drawing function with parameters `[ctx, cell]`

If any other value, it will be called fill the rectangle with the appropriate value (pattern, gradient, color string)

```js
engine.setMethod ({
    unknown: 'black',
    grass: images.get ('grass'),
    magic: function (ctx, cell) {
        var color = (cell.point.x> cell.point.y)? 'red': 'blue';
        
        ctx.fill (cell.rectangle, color);
    }
});
```

#### countSize

```js
Size countSize ()
```

Calculate the size of the tile field in pixels according to the field size, cell size and indentation

```js
var canvas = LibCanvas.buffer (engine.countSize (), true)
```

#### refresh

```js
TileEngine refresh (Context2D ctx, Point translate = null)
```

Redraw the cells that have changed since the last refresh.
Before the first drawing, the all-cells are considered to have changed
If necessary, you can set the offset of the image

```js
engine.refresh (canvas.ctx, new Point (100, 100))
```

#### getCellByIndex

```js
TileEngine.Cell getCellByIndex (Point point)
```

Return the cell to the corresponding coordinates of the field

```js
engine.getCellByIndex (new Point (3, 1))
```

#### getCellByPoint

```js
TileEngine.Cell getCellByPoint (Point point)
```

Return the cell to the corresponding coordinates in pixels

```js
engine.getCellByPoint (new Point (743, 351))
```