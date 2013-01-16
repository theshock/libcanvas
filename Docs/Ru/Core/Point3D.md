LibCanvas.Point3D
=================

`LibCanvas.Point3D` - класс, который описывает точку в трёхмерном пространстве.

#### Global

После вызова LibCanvas.extract() можно использовать короткий алиас "Point3D"

## Создание экземпляра LibCanvas.Point3D

	
Создать экземпляр класса `LibCanvas.Point` можно одним из следующих способов:

```js
var xCoord = 15, yCoord = 20, zCoord = 25;

// передав в конструктор координаты
var point = new LibCanvas.Point3D( xCoord, yCoord, zCoord );

// массив координат
var point = new LibCanvas.Point3D([xCoord, yCoord, zCoord]);

// объект координат
var point = new LibCanvas.Point3D({ x : xCoord, y : yCoord, z: zCoord });

// Другой объект LibCanvas.Point3D
var point = new LibCanvas.Point3D(anotherPoint);

// что равнозначно с
var point = anotherPoint.clone();

// после использования LibCanvas.extract():
var point = new Point3D( xCoord, yCoord, zCoord );
```

## Метод equals

```js
boolean equals(LibCanvas.Point3D to, int accuracy)
```

Метод сравнивает две точки не по ссылкам

#### аргумент `accuracy`

Если указан, то означает количество знаков, с точностью которых будут сравниватся точки (для неточного сравнения)

#### Пример

```js
var bar = new LibCanvas.Point3D(15, 15, 10);
var foo = new LibCanvas.Point3D(15, 15, 10);

trace(bar == foo);      // false
trace(bar.equals(foo)); // true
```

#### Пример с accuracy

```js
var bar = new LibCanvas.Point3D(7, 12.88888324, 15.1111127);
var foo = new LibCanvas.Point3D(7, 12.88888115, 15.1111093);

console.log(bar == foo);         // false
console.log(bar.equals(foo));    // false
console.log(bar.equals(foo, 8)); // false
console.log(bar.equals(foo, 4)); // true
```

## Метод clone

```js
LibCanvas.Point3D clone()
```

Возвращает точку с такими же координатами

#### Пример

```js
var point = new LibCanvas.Point3D(15, 15, 10);
var clone = point.clone();
console.log(point == clone); // false
console.log(point.equals(clone)); // true
```

## Метод move

```js
LibCanvas.Point move(LibCanvas.Point point3d)
```

#### Пример

```js
var point    = new LibCanvas.Point3D(10, 10, 10);
var distance = new LibCanvas.Point3D( 5, -3,  1);

point.move(distance); // Point3D(15, 7, 11)
```

## Метод diff

```js
LibCanvas.Point3D diff(LibCanvas.Point3D point)
```

Этот метод означает примерно следующее :
на сколько надо сдвинуться точке, чтобы она оказалась на месте той, которая передана первым аргументом

#### Пример

```js
var pO = new LibCanvas.Point3D(10, 10, 7);
var pA = new LibCanvas.Point3D(15, 18, 7);

pA.diff(pO); // Point3D(-5, -8, 0)
``

## Метод map

```js
LibCanvas.Point3D map(callback, context)
```

Изменяет значения точки согласно результату вызова callback

#### Пример

```js
var point = new LibCanvas.Point3D(1, 2, 3);

point.map(function (value, coord, point) {
	return value * value;
});

atom.trace( point ); // Point3D(1, 4, 9)
```

## Метод add

```js
LibCanvas.Point3D add(value)
```

Увеличить значение всех координат точки на `value`

#### Пример

```js
var point = new LibCanvas.Point3D(1, 2, 3);

point.add(5);

atom.trace( point ); // Point3D(6, 7, 8)
```

## Метод mul

```js
LibCanvas.Point3D mul(value)
```

Умножить значение всех координат точки на `value`

#### Пример

```js
var point = new LibCanvas.Point3D(1, 2, 3);

point.mul(5);

atom.trace( point ); // Point3D(5, 10, 15)
```