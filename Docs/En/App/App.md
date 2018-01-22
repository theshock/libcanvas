LibCanvas.App
=============

`LibCanvas.App` is the framework for building interactive applications on LibCanvas.

#### Global

After calling LibCanvas.extract (), you can use the short alias "App"

### Initialization

```js
var app = new LibCanvas.App (object settings)
```

Settings can contain the following parameters:

* `appendTo` - the element to which you want to add the application. The default is `body`
* `size` - dimensions of the application window, object LibCanvas.Size
* `simple` - if `true`, then it will generate a simplified layout - from one canvas, but without the ability to create and shift layers

#### Example

```js
var app = new App ({
    appendTo: '#container',
    size: new Size (800, 500)
})
```

#### Normal layout for three layers:

```html
<div style = "width: 1200px; height: 800px;" class = "libcanvas-app">
    <div style = "overflow: hidden; position: absolute; width: 1200px; height: 800px;">
        <canvas width = "1200" height = "800" data-name = "bg" style = "position: absolute; z-index: 0;"> </canvas>
        <canvas width = "1200" height = "800" data-name = "foo" style = "position: absolute; z-index: 1;"> </canvas>
        <canvas width = "1200" height = "800" data-name = "bar" style = "position: absolute; z-index: 2;"> </canvas>
    </div>
</div>
```

#### Simplified layout (maximum one layer):

```html
<canvas width = "391" height = "71" class = "libcanvas-app-simple"> </canvas>
```

#### Resizing an application:

Only the size of the application will change, the size of each layer will remain the same.

```js
app.container.size = new Size (1500, 1200);
```


### Methods

#### createLayer

```js
LibCanvas.App.Layer createLayer (object settings)
```

Creates and returns a LibCanvas.App

```js
var layer = app.createLayer ({name: 'units'});
```

#### destroy

```js
LibCanvas.App destroy ()
```

Destroys the application

```js
app.destroy ();
```

#### zIndexCompare

```js
int zIndexCompare (LibCanvas.App.Element left, LibCanvas.App.Element right)
```

Compares the position of each of the elements and returns -1 if the left is higher, +1 if the right is higher and 0 if they are on the same level