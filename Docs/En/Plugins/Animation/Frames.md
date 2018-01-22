Plugins.Animation.Frames
========================

A class that is used to "cut" pictures from one tile picture.
Typically, animation frames are similar to each other and it makes sense to put them together into a single image like css-sprites.
Let's say you have an animation frame width of 50 pixels, a height of 40, 15 frames. You can draw them in three rows in a picture size of 250 * 120.

! [An example of cutting animation frames] (https://raw.github.com/theshock/libcanvas/master/Docs/Ru/Plugins/Animation/frames-demo.png)

### Initialization

```js
new Animation.Frames (Image image, int width = null, int height = null)
```

* `image` (* Image *) - source image for cutting
* `width` (* int *) - the width of the frame. Equal to the width of the picture, if `null`
* `height` (* int *) - the height of the frame. The height of the picture is equal, if `null`


```js
var frames = new Animation.Frames (images.get ('ship'), 100);
```

### Methods

`get length` - number of frames in the array

```js
console.log (frames.length);
```


#### get

```js
canvasElement get (int index);
```

Returns the picture-frame, part of the original picture.

```js
var frame = frames.get (5);
```