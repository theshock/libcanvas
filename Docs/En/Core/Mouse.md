LibCanvas.Mouse
===============

`LibCanvas.Mouse` provides an interface for transparent mouse control

#### Global

After calling LibCanvas.extract (), you can use the short alias "Mouse"

## Static properties

#### method prevent

Can use to silence the mouse event by default:

```js
window.onclick = Mouse.prevent;
```

#### method getOffset

```js
LibCanvas.Point getOffset (MouseEvent e, DOMElement element)
```

Determines the position of the mouse relative to the element

```js
var offset = Mouse.getOffset (event, canvas);
```

#### method addWheelDelta

```js
MouseEvent addWheelDelta (MouseEvent e)
```

Adds the cross-browser property `delta` to the event object, which indicates the direction of movement of the mouse wheel

## Creating an instance of LibCanvas.Mouse

The first argument is an element whose events should be listened to.

```js
var mouse = new LibCanvas.Mouse (myCanvas);
```

## Properties

`point` - `LibCanvas.Point`, with the current coordinates of the mouse relative to the beginning of the element

`previous` - `LibCanvas.Point`, the previous coordinates of the mouse relative to the beginning of the element

`delta` - `LibCanvas.Point`, the last offset of the coordinates of the mouse

`events` - the object `atom.Events`

## Developments

* click
* dblclick
* contextmenu
* wheel
* over
* out
* down
* up
* move

#### Example

```js
mouse.events.add ('click', function (event, mouse) {
    // draw a circle with a radius of 10 pixels at the click point:
    canvas.ctx.fill (
        new Circle (mouse.point, 10)
    );
});
```

#### Features

The `wheel` event has an additional property `delta`, which is indicated by the direction of movement of the wheel - "-1" or "1".