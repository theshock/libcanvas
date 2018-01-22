Plugins.Curves
==============

Drawing bezier curves with dynamic width and color. Extends the built-in Context2D object ('2d-libcanvas'), providing a convenient method `drawCurve`

! [libcanvas curves example] (https://raw.github.com/theshock/libcanvas/master/Docs/Ru/Plugins/curves.png)

### Initialization

```js
Context2D drawCurve (object params)
```

* `from` (* Point *) - the starting point of the curve
* `to` (* Point *) - the end point of the curve
* `points` (* Point [] *) - an array of control points. Can contain 0, 1 or 2 points
* `inverted` (* Boolean *) - adds" ribbon "(see screenshot above)
* `gradient` (* object *) - describes a smooth change in the color of the curve
* `from` (* string *) - initial color
* `to` (* string *) - the final color
* `fn` (* string *) - color change function (see [atom.Transition] (https://github.com/theshock/atomjs/blob/master/Docs/En/Declare/Transition.md))
* `width` (* object *) - describes a smooth change in the color of the curve
* `from` (* number *) - initial width
* `to` (* number *) - initial width
* `fn` (* string *) - the function of changing the width (see [atom.Transition] (https://github.com/theshock/atomjs/blob/master/Docs/En/Declare/Transition.md))

```js

ctx.drawCurve ({
    from: new Point (100, 250),
    to: new Point (200, 100),
    points: [new Point (100, 100), new Point (250, 250)],
    inverted: true,
    gradient: {
        from: '# ff0',
        to: '# f00',
        fn: 'linear'
    },
    width: {
        from: 30,
        to: 1,
        fn: 'sine-in'
    }
});
```