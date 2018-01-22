Engines.Tile.Engine.Cell
========================

Each cell of the tile engine is an object of `TileEngine.Cell`
These objects are not created manually, only within `TileEngine` and are used for two purposes:
* Change and get the value of a cell
* Data container for cell drawing

### Properties

* `engine` - reference to the engine `TileEngine`
* `point` - cell coordinates on the field
* `rectangle` - a rectangle that describes a cell in pixels
* `value` - is the current value of the cell. Changing this property automatically updates `requireUpdate` for `TileEngine`