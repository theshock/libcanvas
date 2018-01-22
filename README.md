## LibCanvas Javascript Framework

*LibCanvas* is a free javascript library, based on [AtomJS framework](https://github.com/theshock/atomjs) and available under [LGPL](http://www.gnu.org/copyleft/lgpl.html)/[MIT](http://opensource.org/licenses/mit-license.php) License.

#### [Examples](http://libcanvas.github.com/)

Current objectives of the project:

* Full documentation

For consultation, write to shocksilien@gmail.com

## Features of LibCanvas

LibCanvas is a library for creating interactive applications and games on html5. Main features:

* [Advanced 2D Context](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Core/Context2D.md):
  * Method chaining
  * Figures as arguments
  * Additional methods
  * Named arguments

* [Geometry](https://github.com/theshock/libcanvas/tree/master/Docs/Ru/Shapes)
  * [Actions with points](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Core/Point.md)
  * Changing the shape
  * Intersections
  * Basic mathematical operations


* [LibCanvas.App Framework](https://github.com/theshock/libcanvas/tree/master/Docs/Ru/App)
  * Drawing only the changed parts of the canvas
  * Mouse events
  * Draggable / Droppable
  * Layers, internal zIndex
  * Fast layer displacement


* Game engines
  * [Cache](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Engines/Tile/)
  * [Isometric](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Engines/Isometric/Projection.md)
  * [Hexagonal](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Engines/Hex/Projection.md)


* Additional features (plugins)
  * [Sprite animations](https://github.com/theshock/libcanvas/tree/master/Docs/Ru/Plugins/Animation)
  * [Mathematical model of Bezier curves](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Plugins/Curve.md) (for building paths)
  * [Curves with dynamic width and color](https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Plugins/Curves.md)
  * Sprite fonts
  * Rendering texture in projection

## Integration

* [Gem for Ruby on Rails](https://github.com/tanraya/libcanvas-rails)

## Switching to the new version

On December 21, 2012, the main branch "declare" was publicly translated into "master".

The previous version is still available [in the previous branch](https://github.com/theshock/libcanvas/tree/previous), but is no longer being developed.

Major changes in the new version:

* Completely rewritten code, removed the main architecture bugs and non-obvious things
* Improved performance of the main components of the library
* No longer requires prototype expansion. It is still supported, but now completely on the conscience of the user - the library does not require atom-extended prototypes
* Used atom.declare instead of atom.Class in order to improve performance and investment debug