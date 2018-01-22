Plugins.Animation
=================

Class for creating one case of animation playback based on the `Plugins.Animation.Sheet` prototype

### Initialization

```js
new Animation (object settings)
```

Settings can contain the following parameters:

* `sheet` (* Animation.Sheet *) - the prototype of animation

```js
animation = new Animation ({
    sheet: this.animationSheet,
    onUpdate: this.redraw,
    onStop: this.destroy,
});
```

### Developments

`update` - is called when an animation frame is switched or when an animation is launched

`stop` - it is called when the animation ends with the last frame or when forced by the `stop` method

### Methods

#### stop

```js
Animation stop ();
```

Stop animation

```js
animation.stop ();
```

#### run

```js
Animation run ();
```

Start the animation first.

```js
animation.run ();
```

#### synchronize

```js
Animation synchronize ();
```

Synchronize the start of the animation with another animation.

```js
fooAnimation.synchronize (coreAnimation);
barAnimation.synchronize (coreAnimation);

coreAnimation.run ();

// fooAnimation.startTime == barAnimation.startTime == coreAnimation.startTime
```

#### get

```js
Animation get ();
```

Get the current animation frame or `null` if the animation is stopped, has run out or is not running.

```js
var frame = animation.get ();
```

### A complex example based on LibCanvas.App

```js

/ ** @class ExplosionLauncher * /
atom.declare ('ExplosionLauncher', {
    initialize: function (layer, images) {
        this.layer = layer;
        
        this.animationSheet = new Animation.Sheet ({
            frames: new Animation.Frames (images.get ('explosion'), 50, 50),
            delay: 40
        })
    },
    
    explode: function (coordinates) {
        new Explosion (this.layer, {
            sheet: this.animationSheet,
            shape: new Circle (coordinates, 50)
        });
    }
});

/ ** @class Explosion * /
atom.declare ('Explosion', App.Element, {
    configure: function () {
        this.animation = new Animation ({
            sheet: this.settings.get ('sheet'),
            onUpdate: this.redraw,
            onStop: this.destroy,
        });
    },

    renderTo: function (ctx) {
        ctx.drawImage ({
            image: this.animation.get (),
            center: this.shape.center
        });
    }
});
```