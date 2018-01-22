Plugins.Animation.Element
=========================

The class that is used to create a picture-animation for insertion into a dom-tree

```js
atom.dom Animation.Image.element (Animation animation);
atom.dom Animation.Image.element (Animation.Sheet sheet);
```

### Example

```js
function appendAnimatedLogoTo (targetElement) {
    var logoSheet = new Animation.Sheet ({
        frames: new Animation.Frames (images.get ('logo'), 50, 50),
        delay: 40,
        looped: true
    });
    
    Animation.Image.element (logoSheet) .appendTo (targetElement);
}
```