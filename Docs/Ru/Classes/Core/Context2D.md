LibCanvas.Context2D
===================

`LibCanvas.Context2D` - значительно расширенный стандартный 2d-контекст, который можно получить так:

	var context = canvas.getContext('2d-libcanvas')

Основная его идея - все методы, если не требуется иного возвращают ссылку на контекст для использования в цепочках вызовов, возможность использования именованных аргументов и использование объектов LibCanvas.

Кроме этого он предоставляет множество нестандартных методов.

## Свойства

### canvas (get)
Ссылка на родительский dom-елемент

### width (get/set)
Возвращает/изменяет ширину холста

### height (get/set)
Возвращает/изменяет высоту холста

### rectangle (get)
Возвращает ссылку на прямоугольник, соответствующий размерам холста
Крайне не рекомендуется работать напрямую с этим объектом. Если необходимо - используйте клон.

#### Пример
	if (context.rectangle.hasPoint(somePoint)) doSmth();

	// Изменяем прямоугольник
	var clone = context.rectangle.clone();

	clone.height /= 2;
	clone.width  /= 2;

	context.fillAll( clone, 'red' );

### shadow (get/set)
Позволяет получить/установить свойства shadowOffsetX, shadowOffsetY, shadowBlur и shadowColor лаконичным способом

#### Пример
	context.shadow = '1 2 3 black';

	// Аналог:
	context.shadowOffsetX = 1;
	context.shadowOffsetY = 2;
	context.shadowBlur    = 3;
	context.shadowColor   = 'black;


## Метод getClone

	HTMLCanvasElement getClone(int width, int height)

Возвращает холст, равный по изображению и с измененным размером, если указаны width и height
Может применятся для создания копии текущего слоя, маленькой иконки, итд.

#### Пример
	context.drawImage(context.getClone(64, 48));

## Метод set

	[this] set(object properties)
	[this] set(string propertyName, string propertyValue)

Указывает свойства холста

#### Пример

	context
		.set({
			fillStyle  : black,
			strokeStyle: blue
		})
		.set('globalOpacity', 0.5);

## Метод get

	string get(string propertyName)

Получить значения свойства

#### Пример
	context.get('fillStyle');

## Метод fillAll

	[this] fillAll()
	[this] fillAll(string fillStyle)

Заливает весь холст цветом fillStyle или цветом по-умолчанию, если аргумент не передан

#### Пример

	context.fillAll('red');

## Метод strokeAll

	[this] strokeAll()
	[this] strokeAll(string strokeStyle)

Обводит весь холст цветом strokeStyle или цветом по-умолчанию, если аргумент не передан

#### Пример

	context.strokeAll('rgb(255, 245, 200)');

## Метод clearAll

	[this] clearAll()

Очищает холст

#### Пример

	context.clearAll();

## Метод fill

	[this] fill()
	[this] fill(string fillStyle)
	[this] fill(Shape shape)
	[this] fill(Shape shape, string fillStyle)

Заливает фигуру или текущий путь цветом fillStyle или цветом по-умолчанию, если аргумент не передан

#### Пример

	context.fill(new Circle(50, 50, 20), 'red');

## Метод stroke

	[this] stroke()
	[this] stroke(string fillStyle)
	[this] stroke(Shape shape)
	[this] stroke(Shape shape, string fillStyle)

Обводит фигуру или текущий путь цветом strokeStyle или цветом по-умолчанию, если аргумент не передан

#### Пример

	context.stroke(new Circle(50, 50, 20), 'red');

## Метод clear

	[this] clear(Shape shape)

Очищает фигуру, переданную первым аргументом. (сглаживание - выключено!)

## Метод fillRect
	[this] fillRect(LibCanvas.Shapes.Rectangle rectangle)
	[this] fillRect(int fromX, int fromY, int width, int height)

## Метод strokeRect
	[this] strokeRect(LibCanvas.Shapes.Rectangle rectangle)
	[this] strokeRect(int fromX, int fromY, int width, int height)

## Метод clearRect
	[this] clearRect(LibCanvas.Shapes.Rectangle rectangle)
	[this] clearRect(int fromX, int fromY, int width, int height)

#### Пример

	context.clear(new Circle(50, 50, 20));

## Методы save/restore

	[this] save()

Сохраняет настройки холста в стек

	[this] restore()

Восстанавливает последние сохранённые настройки холста

#### Пример
	context.set({ fillStyle: 'blue' });
	context.save();
		context.set({ fillStyle: 'red' });
		context.fillAll(); // заливаем всё красным цветом
	context.restore();
	context.fillAll(); // заливаем всё синим цветом

# Создание пути

## Метод beginPath

	[this] beginPath()
	[this] beginPath(point)
	[this] beginPath(int x, int y)

Открывает путь. Если есть аргументы, то вызывает метод `moveTo`

## Метод closePath

	[this] closePath()
	[this] closePath(LibCanvas.Point point)
	[this] closePath(int x, int y)

Закрывает путь. Если есть аргументы, то вызывает метод `lineTo`

## Метод moveTo

	[this] moveTo(LibCanvas.Point point);
	[this] moveTo(int x, int y);

Перемещает указатель пути в точку point

## Метод lineTo

	[this] lineTo(LibCanvas.Point point);
	[this] lineTo(int x, int y);

Прокладывает линию в точку point

## Метод arc

	[this] lineTo(object params);

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

	context.arc({
		circle: new LibCanvas.Shapes.Circle(50, 50, 25),
		angle : [(30).degree(), (60).degree()]
	});

## Метод curveTo

	[this] curveTo(object params);

Отрисовывает кривую Безье по контрольным точкам.

#### Опции

`to`    (*LibCanvas.Point*) - куда проложить кривую

`point` (*LibCanvas.Point[]*) - массив контрольных точек. Может быть две, одна или не быть.

#### Пример

	context.curveTo({
		to: [100, 100],
		points : [
			[80, 30],
			[20, 90]
		]
	});

	// равносильно

	context.bezierCurveTo(80, 30, 20, 90, 100, 100);

## Метод isPointInPath

	boolean isPointInPath(LibCanvas.Point point);
	boolean isPointInPath(int x, int y);

Проверяет, находится ли данная точка в пределах отрисованного пути

#### Пример

	context.isPointInPath([15, 20]);

## Метод clip

	[this] clip();
	[this] clip(LibCanvas.Shape shape);

Ограничивает отрисовку в холст определённым участком.
Если аргумент `shape` не передан, то будет использоваться текущий путь

#### Пример
	// всё, что за пределами круга - не отрисуется
	context.clip(new Circle(100, 100, 50));
	context.fillRect(100, 100, 100, 100);

## Метод rotate

	[this] rotate(number angle);
	[this] rotate(number angle, LibCanvas.Point pivot);

## Метод translate

	[this] translate (LibCanvas.Point point)
	[this] translate (LibCanvas.Point point, boolean reverse)
	[this] translate (int x, int y)

## Метод text
	[this] text(object params)

#### Опции

`text`       (*string*)

`color`      (*string*)

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

## Метод drawImage
	[this] drawImage(element image)
	[this] drawImage(object params)


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

## Метод projectiveImage
###### testing

	[this] projectiveImage(object params)

## Метод getPixel
	[this] getPixel(LibCanvas.Point point)

Возвращает значение цвета пикселя в точке point в формате {r: [0, 255], g: [0, 255], b: [0, 255], a: [0, 1]}
Аргумент можно передать конструктору Color.

#### Пример

	libcanvas.mouse.addEvent( 'click', function (e) {
		var pixel = libcanvas.ctx.getPixel(e.offset);
		trace( new Color( pixel ) );
	});

	libcanvas.mouse.addEvent( 'click', function (e) {
		var pixel = libcanvas.ctx.getPixel(e.offset);

		pixel.a > 0.1 ?
			alert('Пиксель видим')  :
			alert('Пиксель невидим');
	});

## Метод createGradient
	[RadialGradient] createGradient(Circle from, Circle to, Object colors)
	[LinearGradient] createGradient(Point  from, Point  to, Object colors)
	[LinearGradient] createGradient(Rectangle rect, Object colors)

Создаёт и возвращает радиальный или линеарный градиент с стоп-цветами, указанными в colors

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