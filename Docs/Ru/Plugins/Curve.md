Plugins.Curve
=============

Математическая база для Кривых Безье. Может использоваться для создания анимаций движения по пути и для других целей.

### Инициализация

```js
// Quadratic curve, one control point
var curve = new LibCanvas.Plugins.Curve({
	from: new Point(100, 100),
	to  : new Point(200, 300),
	points: [
		new Point(200, 100)
	]
});

// Qubic curve, two control points
var curve = new LibCanvas.Plugins.Curve({
	from: new Point(100, 100),
	to  : new Point(200, 300),
	points: [
		new Point(200, 100),
		new Point(100, 200),
	]
});
```

* `from` (*LibCanvas.Point*) - точка начала кривой
* `to` (*LibCanvas.Point*) - точка окончания кривой
* `points` (*LibCanvas.Point[]*) - массив контрольных точек кривой

### Методы

#### getPoint

```js
LibCanvas.Point getPoint(float t)
```

`t` - число между 0 и 1. Возвращает координаты точки прямой.


```js
var point = curve.getPoint( 0.45 )
```


#### getAngle

```js
float getAngle(float t)
```

`t` - число между 0 и 1. Возвращает угол кривой в соответствующем месте


```js
var angle = curve.getAngle( 0.45 )
```
