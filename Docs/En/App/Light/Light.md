LibCanvas.App.Light
===================

`LibCanvas.App.Light` - add-on above `LibCanvas.App` for a lighter and more accessible interface

### Initialization

```js
var helper = new LibCanvas.App.Light (LibCanvas.Size size, object settings)
```

`size` - the size of the application

Settings can contain the following parameters:

* `mouse` - whether the mouse will be used (by default `true`)
* `appendTo` - which element you want to attach the application to (default is `body`)

#### Example

```js
var helper = new LibCanvas.App.Light (new Size (800, 500))
```

### Methods

#### createVector

```js
App.Light.Vector createVector (LibCanvas.Shape shape, object settings)
```

Creates, adds to the application, and returns the App.Light.Vector element, which serves to draw geometric shapes in the application

```js
var vector = helper.createVector (new Circle (100, 100, 20));
```

#### createText

```js
App.Light.Text createText (LibCanvas.Shape shape, object style, object settings)
```

Creates, adds to the application, and returns an App.Light.Text element, which serves to draw text in the application
The contents of `style` according to the interface of the method [Context2D.text] (https://github.com/theshock/libcanvas/blob/master/Docs/Ru/Core/Context2D.md#%D0%9C%D0%B5%D1% 82% D0% BE% D0% B4-text)

```js
var text = helper.createText (
    new Rectangle (0, 0, 100, 40),
    {
        text: 'Hello, World!',
        bold: true
    }
);
```

#### createImage

```js
App.Light.Image createImage (LibCanvas.Shape shape, Image image, object settings)
```

Creates, adds to the application and returns the element App.Light.Image, which serves to draw pictures in the application

```js

atom.ImagePreloader.run ({logo: 'html5-logo.png'},
    function (images) {
        var element = helper.createImage (
        new Rectangle (64, 64, 256, 256),
        images.get ('logo')
    );
});
```