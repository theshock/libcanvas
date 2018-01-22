Plugins.Animation.Sheet
=======================

A class for describing the animation, its prototype from which all objects will be repelled.
Describes the delay between frames, their fixation and the order of playback. It is a technical class whose entities are used only for passing settings to the animation class.

### Initialization

```js
new Animation.Sheet (object settings)
```

Settings can contain the following parameters:

* `frames` (* Animation.Frames *) - the list of source frames to be combined into an animation
* `delay` (* int *) - the delay between frames in milliseconds
* `looped` (* bool *) - whether the animation is looped or ends with the after frame
* `sequence` (* int [] *) - the order of frames (by default - from the first to the last frame of the animation)

```js
new Animation.Sheet ({
    frames: new Animation.Frames (sourceImage),
    delay: 40,
    looped: true,
    sequence: [0,1,1,2,1,2,2,3,4,5,4,5]
})
```