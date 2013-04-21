LibCanvas.Context2D
===================

`LibCanvas.Context2D` - значительно расширенный стандартный 2d-контекст, который можно получить так:

```js
var context = canvas.getContext('2d-libcanvas');
// alternate syntax:
var context = new LibCanvas.Context2D(canvas);
```

Основная его идея - все методы, если не требуется иного возвращают ссылку на контекст для использования в цепочках вызовов, возможность использования именованных аргументов и использование объектов LibCanvas.

Кроме этого он предоставляет множество нестандартных методов.

#### Global

После вызова LibCanvas.extract() можно использовать короткий алиас "Context2D"

## Свойства

### canvas (get)
Ссылка на родительский dom-елемент

### width (get/set)
Возвращает/изменяет ширину холста

### height (get/set)
Возвращает/изменяет высоту холста

### size (get/set)
Возвращает/изменяет высоту холста

```js
context.size = new Size(400, 250);
```

### rectangle (get)
Возвращает ссылку на прямоугольник, соответствующий размерам холста
Крайне не рекомендуется работать напрямую с этим объектом. Если необходимо - используйте клон.

#### Пример

```js
if (context.rectangle.hasPoint(somePoint)) {
	// Точка находится в пределах холста
	doSmth();
}

// Изменяем прямоугольник
var clone = context.rectangle.clone();

clone.height /= 2;
clone.width  /= 2;

context.fillAll( clone, 'red' );
```

### shadow (get/set)
Позволяет получить/установить свойства shadowOffsetX, shadowOffsetY, shadowBlur и shadowColor лаконичным способом

#### Пример

```js
context.shadow = '1 2 3 black';

// Аналог:
context.shadowOffsetX = 1;
context.shadowOffsetY = 2;
context.shadowBlur    = 3;
context.shadowColor   = 'black;
```

## Метод getClone

```js
HTMLCanvasElement getClone(int width, int height)
```

Возвращает холст, равный по изображению и с измененным размером, если указаны width и height
Может применятся для создания копии текущего слоя, маленькой иконки, итд.

#### Пример

```js
context.drawImage(context.getClone(64, 48));
```

## Метод set

```js
[this] set(object properties)
[this] set(string propertyName, string propertyValue)
```

Указывает свойства холста

#### Пример

```js
context
	.set({
		fillStyle  : 'black',
		strokeStyle: 'blue'
	})
	.set('globalOpacity', 0.5);
```

## Метод get

```js
string get(string propertyName)
```

Получить значения свойства

#### Пример

```js
context.get('fillStyle');
```

## Метод fillAll

```js
[this] fillAll()
[this] fillAll(string fillStyle)
```

Заливает весь холст цветом fillStyle или цветом по-умолчанию, если аргумент не передан

#### Пример

```js
context.fillAll('red');
```

## Метод strokeAll

```js
[this] strokeAll()
[this] strokeAll(string strokeStyle)
```

Обводит весь холст цветом strokeStyle или цветом по-умолчанию, если аргумент не передан

#### Пример

```js
context.strokeAll('rgb(255, 245, 200)');
```

## Метод clearAll

```js
[this] clearAll()
```

Очищает холст

#### Пример

```js
context.clearAll();
```

## Метод fill

```js
[this] fill()
[this] fill(string fillStyle)
[this] fill(Shape shape)
[this] fill(Shape shape, string fillStyle)
```

Заливает фигуру или текущий путь цветом fillStyle или цветом по-умолчанию, если аргумент не передан

#### Пример

```js
context.fill(new Circle(50, 50, 20), 'red');
```

## Метод stroke

```js
[this] stroke()
[this] stroke(string fillStyle)
[this] stroke(Shape shape)
[this] stroke(Shape shape, string fillStyle)
```

Обводит фигуру или текущий путь цветом strokeStyle или цветом по-умолчанию, если аргумент не передан

#### Пример

```js
context.stroke(new Circle(50, 50, 20), 'red');
```

## Метод clear

```js
[this] clear(Shape shape)
```

Очищает фигуру, переданную первым аргументом. (сглаживание - выключено!)

## Метод fillRect

```js
[this] fillRect(LibCanvas.Shapes.Rectangle rectangle)
[this] fillRect(int fromX, int fromY, int width, int height)
```

## Метод strokeRect

```js
[this] strokeRect(LibCanvas.Shapes.Rectangle rectangle)
[this] strokeRect(int fromX, int fromY, int width, int height)
```

## Метод clearRect

```js
[this] clearRect(LibCanvas.Shapes.Rectangle rectangle)
[this] clearRect(int fromX, int fromY, int width, int height)
```

#### Пример

```js
context.clear(new Circle(50, 50, 20));
```

## Методы save/restore

```js
[this] save()
```

Сохраняет настройки холста в стек

```js
[this] restore()
```

Восстанавливает последние сохранённые настройки холста

#### Пример

```js
context.set({ fillStyle: 'blue' });
context.save();
	context.set({ fillStyle: 'red' });
	context.fillAll(); // заливаем всё красным цветом
context.restore();
context.fillAll(); // заливаем всё синим цветом
```

# Создание пути

## Метод beginPath

```js
[this] beginPath()
[this] beginPath(point)
[this] beginPath(int x, int y)
```

Открывает путь. Если есть аргументы, то вызывает метод `moveTo`

## Метод closePath

```js
[this] closePath()
[this] closePath(LibCanvas.Point point)
[this] closePath(int x, int y)
```

Закрывает путь. Если есть аргументы, то вызывает метод `lineTo`

## Метод moveTo

```js
[this] moveTo(LibCanvas.Point point);
[this] moveTo(int x, int y);
```

Перемещает указатель пути в точку point

## Метод lineTo

```js
[this] lineTo(LibCanvas.Point point);
[this] lineTo(int x, int y);
```

Прокладывает линию в точку point

## Метод arc

```js
[this] lineTo(object params);
```

Проложить дугу

#### Опции

`circle`    (*LibCanvas.Shapes.Circle*) - круг, по котором необходимо отрисовывать дугу

`angle`     (*object*) - угол, который дуга отрисовывает. Необходимо два из трех параметров:

* `start`  (*int*) - откуда дуга начинается (в радианах)
* `end`    (*int*) - где дуга заканчивается (в радианах)
* `size`   (*int*) - размер дуги (в радианах)

Если передан массив из двух элементов, то предполагается, что первый - это start, а второй - end

`anticlockwise` или `acw` - если указано в true, то направление движения против часовой стрелки

#### Пример

```js
context.arc({
	circle: new LibCanvas.Shapes.Circle(50, 50, 25),
	angle : [(30).degree(), (60).degree()]
});
```

## Метод curveTo

```js
[this] curveTo(object params);
```

Отрисовывает кривую Безье по контрольным точкам.

#### Опции

`to`    (*LibCanvas.Point*) - куда проложить кривую

`point` (*LibCanvas.Point[]*) - массив контрольных точек. Может быть две, одна или не быть.

#### Пример

```js
context.curveTo({
	to: [100, 100],
	points : [
		[80, 30],
		[20, 90]
	]
});
```
	// равносильно

```js
context.bezierCurveTo(80, 30, 20, 90, 100, 100);
```

## Метод isPointInPath

```js
boolean isPointInPath(LibCanvas.Point point);
boolean isPointInPath(int x, int y);
```

Проверяет, находится ли данная точка в пределах отрисованного пути

#### Пример

```js
context.isPointInPath([15, 20]);
```

## Метод clip

```js
[this] clip();
[this] clip(LibCanvas.Shape shape);
```

Ограничивает отрисовку в холст определённым участком.
Если аргумент `shape` не передан, то будет использоваться текущий путь

#### Пример

```js
// всё, что за пределами круга - не отрисуется
context.clip(new Circle(100, 100, 50));
context.fillRect(100, 100, 100, 100);
```

## Метод rotate

```js
[this] rotate(number angle);
[this] rotate(number angle, LibCanvas.Point pivot);
```

## Метод translate

```js
[this] translate (LibCanvas.Point point)
[this] translate (LibCanvas.Point point, boolean reverse)
[this] translate (int x, int y)
```

## Метод text

```js
[this] text(object params)
```

#### Опции

`text`       (*string*)

`color`      (*string*)

`stroke`     (*bool, по-умолчанию = false*) если параметр = true то вместо canvas.fillStyle() вызывается canvas.strokeStyle,
то есть включается режим "обводки текста" при этом сам текст остается прозрачным. Если надо нарисовать и текст,
и обводку текста то надо сначала вызвать метод text со stroke=true, а потом ещё раз со stroke=false.

`lineWidth`  (*int*) указывает толщину линии обводки текста при stroke = true, при этом надо внимательно проверять
результат -- некоторые браузеры рендерят обводку сложных букв (w,m,n, etc) с артефактами и, возможно, прийдётся поиграть
с толщиной обводки/ размером текста

`wrap`       (*string*) no|normal

`to`         (*LibCanvas.Shapes.Rectangle*) по-умолчанию вызывается метод this.getFullRectangle

`align`      (*string*) center|left|right

`size`       (*int, по-умолчанию = 16*)

`weight`     (*string*) bold|normal

`style`      (*string*) italic|normal

`family`     (*string*, по-умолчанию = sans-serif)

`lineHeight` (*int*)

`overflow`   (*string*, по-умолчанию = visible) hidden|visible

`padding`    (*int|int[]*, по-умолчанию = 0) [topBottom, leftRight]

`shadow`     (*string*) включает режим рендеринга тени для текста. Формат как в канвасе: `'shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor'`. 
Например: `shadow: '0 -1 3 #616161'`. Не забывайте цвет указывать с символом '#". Хром то покажет, а вот остальные браузеры нет :).

## Метод drawImage

```js
[this] drawImage(element image)
[this] drawImage(object params)
```

#### Опции

Требуется только одна из опций `from`, `center`, `draw`

`image`  (*element*) картинка, которую вы собираетес отрисовывать

`from`   (*LibCanvas.Point*) верхняя левая точка, откуда отрисовывать картинку

`center` (*LibCanvas.Point*) центральная точка, откуда отрисовывать картинку

`draw`   (*LibCanvas.Shapes.Rectangle*) прямоугольник, в который отрисовать картинку. Картинка скейлится до размеров многоугольника.

`crop`   (*LibCanvas.Shapes.Rectangle*) прямоугольник, который указывает на часть картинки, которую нужно вырезать (применяется только при использовании draw)

`angle`  (*int*) угол наклона картинки в радианах

`scale`  (*LibCanvas.Point*) ресайз картинки. Может использоваться для отражения картинки по вертикали или горизонатали

Принцип простой - если есть `draw` и `crop`, то сначала применяется `crop` к картинке, потом она размещается согласно `from|center|draw`, потом разворачивается вокруг центра на угол angle по часовой стрелке и так отрисовывается.

#### Пример

```js
context.drawImage({
	image : this.image,
	center: this.position,
	angle : this.angle
});

context.drawImage({
	image: canvas,
	crop : [100, 100, 50, 50],
	draw : [250, 250, 50, 50]
});

context.drawImage({
	image: this.image,
	from : this.from,
	scale: new Point(-1, 1) // flipX
});
```

## Метод projectiveImage
###### testing

```js
[this] projectiveImage(object params)
```

## Метод getPixel

```js
[this] getPixel(LibCanvas.Point point)
```

Возвращает значение цвета пикселя в точке point в формате {r: [0, 255], g: [0, 255], b: [0, 255], a: [0, 1]}
Аргумент можно передать конструктору Color.

#### Пример

```js
mouse.events.add( 'click', function () {
	var pixel = ctx.getPixel( mouse.point );
	trace( new atom.Color( pixel ) );
});

mouse.events.add( 'click', function () {
	var pixel = ctx.getPixel( mouse.point );

	pixel.a > 0.1 ?
		alert('Пиксель видим')  :
		alert('Пиксель невидим');
});
```

## Метод createGradient

```js
[RadialGradient] createGradient(Circle from, Circle to, Object colors)
[LinearGradient] createGradient(Point  from, Point  to, Object colors)
[LinearGradient] createGradient(Rectangle rect, Object colors)
```

Создаёт и возвращает радиальный или линеарный градиент с стоп-цветами, указанными в colors

```js
context.createGradient( context.rectangle, {
	'0.0': 'red',
	'0.5': 'blue',
	'1.0': 'green'
});

context.createGradient(
	new Circle(50, 50, 10),
	new Circle(50, 50, 20), {
		'0.0': 'red',
		'0.5': 'blue',
		'1.0': 'green'
	});
```

## Метод createRectangleGradient

	//// todo

# Следующие методы повторяют методы из оригинального контекста:
 * scale
 * transform
 * setTransform
 * fillText
 * strokeText
 * measureText
 * createImageData
 * putImageData
 * getImageData
 * getPixels
 * createLinearGradient
 * createRadialGradient
 * createPattern
 * drawWindow
