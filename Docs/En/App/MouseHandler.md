LibCanvas.App.MouseHandler
==========================

`LibCanvas.App.MouseHandler` - a class that is responsible for the relationship of the events of LibCanvas.Mouse and the objects LibCanvas.App.Element.

### Initialization

```js
LibCanvas.App.MouseHandler (object settings);
```

Settings can contain the following parameters:

* `app` (* LibCanvas.App *) is the application you need to listen to
* `mouse` (* LibCanvas.Mouse *) is a LibCanvas.Mouse object that will notify you about mouse changes
* `search` (* LibCanvas.App.ElementsMouseSearch *) - you can specify an alternative object that is responsible for finding a triggered element, can be used for optimization

#### Example

```js
var app, mouse, mouseHandler;

app = new LibCanvas.App ({size: new Size (300,200)});
mouse = new LibCanvas.Mouse (app.container.bounds);
mouseHandler = new LibCanvas.App.MouseHandler ({app: app, mouse: mouse});
```

The default search engine (LibCanvas.App.ElementsMouseSearch) checks the elements for triggering by calling `isTriggerPoint (Point)`

### Developments

After subscription, all items receive the following events:

* click
* dblclick
* contextmenu
* wheel
* mousedown
* mouseup
* mouseout
* mouseover
* mousemove

### Methods

#### stop

```js
LibCanvas.App.MouseHandler stop ()
```

Stop processing mouse events

```js
mouseHandler.stop ()
```

#### start

```js
LibCanvas.App.MouseHandler start ()
```

Resume mouse event processing

```js
mouseHandler.start ()
```

#### subscribe

```js
LibCanvas.App.MouseHandler subscribe (LibCanvas.App.Element element)
```

Sign the item for mouse events.

```js
mouseHandler.subscribe (element);

element.events.add ('click', function (e) {
  console.log ('element caught mouse click', e);
})
```

#### unsubscribe

```js
LibCanvas.App.MouseHandler unsubscribe (LibCanvas.App.Element element)
```

Deselect an element from mouse events. If the item was deleted from the application using the "destroy" method, the mouse event response will be activated automatically the first time the event is triggered (but not immediately after the destruction). Hidden through `hidden: true` elements still receive mouse events.

```js
mouseHandler.unsubscribe (element);
// Element no longer catches mouse events
```

#### getOverElements

```js
LibCanvas.App.Element [] getOverElements ()
```

Get a list of items on which the mouse is located at the moment (in decreasing order of z-index)

```js
var overElements = mouseHandler.getOverElements ();
overElements.invoke ('destroy');
```

#### fall

```js
LibCanvas.App.MouseHandler fall ()
```

Tells you to fail the mouse event. It is important to remember that if an element is subscribed to mouse events, it "blocks" all the items below. That is, when you click on it, events will not work on the elements under it, even if they also fall into the range of the mouse. If for some reason this behavior does not suit (the element should catch the events itself, but also do not block them for the elements that it covers), you can use "failing":

```js
mouseHandler.subscribe (element);

element.events.add ('mousedown', function (e) {
    console.log ('Mouse pressed over our element', e);
    // But the element under it will also receive this event
    mouseHandler.fall ();
});
```