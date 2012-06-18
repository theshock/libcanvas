LibCanvas.Context2D
===================

`LibCanvas.Context2D` - ����������� ����������� ����������� 2d-��������, ������� ����� �������� ���:

	var context = canvas.getContext('2d-libcanvas');
	// alternate syntax:
	var context = new LibCanvas.Context2D(canvas);

�������� ��� ���� - ��� ������, ���� �� ��������� ����� ���������� ������ �� �������� ��� ������������� � �������� �������, ����������� ������������� ����������� ���������� � ������������� �������� LibCanvas.

����� ����� �� ������������� ��������� ������������� �������.

#### Global

����� ������ LibCanvas.extract() ����� ������������ �������� ����� "Context2D"

## ��������

### canvas (get)
������ �� ������������ dom-�������

### width (get/set)
����������/�������� ������ ������

### height (get/set)
����������/�������� ������ ������

### rectangle (get)
���������� ������ �� �������������, ��������������� �������� ������
������ �� ������������� �������� �������� � ���� ��������. ���� ���������� - ����������� ����.

#### ������

	if (context.rectangle.hasPoint(somePoint)) {
		// ����� ��������� � �������� ������
		doSmth();
	}

	// �������� �������������
	var clone = context.rectangle.clone();

	clone.height /= 2;
	clone.width  /= 2;

	context.fillAll( clone, 'red' );

### shadow (get/set)
��������� ��������/���������� �������� shadowOffsetX, shadowOffsetY, shadowBlur � shadowColor ���������� ��������

#### ������
	context.shadow = '1 2 3 black';

	// ������:
	context.shadowOffsetX = 1;
	context.shadowOffsetY = 2;
	context.shadowBlur    = 3;
	context.shadowColor   = 'black;


## ����� getClone

	HTMLCanvasElement getClone(int width, int height)

���������� �����, ������ �� ����������� � � ���������� ��������, ���� ������� width � height
����� ���������� ��� �������� ����� �������� ����, ��������� ������, ���.

#### ������
	context.drawImage(context.getClone(64, 48));

## ����� set

	[this] set(object properties)
	[this] set(string propertyName, string propertyValue)

��������� �������� ������

#### ������

	context
		.set({
			fillStyle  : black,
			strokeStyle: blue
		})
		.set('globalOpacity', 0.5);

## ����� get

	string get(string propertyName)

�������� �������� ��������

#### ������
	context.get('fillStyle');

## ����� fillAll

	[this] fillAll()
	[this] fillAll(string fillStyle)

�������� ���� ����� ������ fillStyle ��� ������ ��-���������, ���� �������� �� �������

#### ������

	context.fillAll('red');

## ����� strokeAll

	[this] strokeAll()
	[this] strokeAll(string strokeStyle)

������� ���� ����� ������ strokeStyle ��� ������ ��-���������, ���� �������� �� �������

#### ������

	context.strokeAll('rgb(255, 245, 200)');

## ����� clearAll

	[this] clearAll()

������� �����

#### ������

	context.clearAll();

## ����� fill

	[this] fill()
	[this] fill(string fillStyle)
	[this] fill(Shape shape)
	[this] fill(Shape shape, string fillStyle)

�������� ������ ��� ������� ���� ������ fillStyle ��� ������ ��-���������, ���� �������� �� �������

#### ������

	context.fill(new Circle(50, 50, 20), 'red');

## ����� stroke

	[this] stroke()
	[this] stroke(string fillStyle)
	[this] stroke(Shape shape)
	[this] stroke(Shape shape, string fillStyle)

������� ������ ��� ������� ���� ������ strokeStyle ��� ������ ��-���������, ���� �������� �� �������

#### ������

	context.stroke(new Circle(50, 50, 20), 'red');

## ����� clear

	[this] clear(Shape shape)

������� ������, ���������� ������ ����������. (����������� - ���������!)

## ����� fillRect
	[this] fillRect(LibCanvas.Shapes.Rectangle rectangle)
	[this] fillRect(int fromX, int fromY, int width, int height)

## ����� strokeRect
	[this] strokeRect(LibCanvas.Shapes.Rectangle rectangle)
	[this] strokeRect(int fromX, int fromY, int width, int height)

## ����� clearRect
	[this] clearRect(LibCanvas.Shapes.Rectangle rectangle)
	[this] clearRect(int fromX, int fromY, int width, int height)

#### ������

	context.clear(new Circle(50, 50, 20));

## ������ save/restore

	[this] save()

��������� ��������� ������ � ����

	[this] restore()

��������������� ��������� ���������� ��������� ������

#### ������
	context.set({ fillStyle: 'blue' });
	context.save();
		context.set({ fillStyle: 'red' });
		context.fillAll(); // �������� �� ������� ������
	context.restore();
	context.fillAll(); // �������� �� ����� ������

# �������� ����

## ����� beginPath

	[this] beginPath()
	[this] beginPath(point)
	[this] beginPath(int x, int y)

��������� ����. ���� ���� ���������, �� �������� ����� `moveTo`

## ����� closePath

	[this] closePath()
	[this] closePath(LibCanvas.Point point)
	[this] closePath(int x, int y)

��������� ����. ���� ���� ���������, �� �������� ����� `lineTo`

## ����� moveTo

	[this] moveTo(LibCanvas.Point point);
	[this] moveTo(int x, int y);

���������� ��������� ���� � ����� point

## ����� lineTo

	[this] lineTo(LibCanvas.Point point);
	[this] lineTo(int x, int y);

������������ ����� � ����� point

## ����� arc

	[this] lineTo(object params);

��������� ����

#### �����

`circle`    (*LibCanvas.Shapes.Circle*) - ����, �� ������� ���������� ������������ ����

`angle`     (*object*) - ����, ������� ���� ������������. ���������� ��� �� ���� ����������:

* `start`  (*int*) - ������ ���� ���������� (� ��������)
* `end`    (*int*) - ��� ���� ������������� (� ��������)
* `size`   (*int*) - ������ ���� (� ��������)

���� ������� ������ �� ���� ���������, �� ��������������, ��� ������ - ��� start, � ������ - end

`anticlockwise` ��� `acw` - ���� ������� � true, �� ����������� �������� ������ ������� �������

#### ������

	context.arc({
		circle: new LibCanvas.Shapes.Circle(50, 50, 25),
		angle : [(30).degree(), (60).degree()]
	});

## ����� curveTo

	[this] curveTo(object params);

������������ ������ ����� �� ����������� ������.

#### �����

`to`    (*LibCanvas.Point*) - ���� ��������� ������

`point` (*LibCanvas.Point[]*) - ������ ����������� �����. ����� ���� ���, ���� ��� �� ����.

#### ������

	context.curveTo({
		to: [100, 100],
		points : [
			[80, 30],
			[20, 90]
		]
	});

	// �����������

	context.bezierCurveTo(80, 30, 20, 90, 100, 100);

## ����� isPointInPath

	boolean isPointInPath(LibCanvas.Point point);
	boolean isPointInPath(int x, int y);

���������, ��������� �� ������ ����� � �������� ������������� ����

#### ������

	context.isPointInPath([15, 20]);

## ����� clip

	[this] clip();
	[this] clip(LibCanvas.Shape shape);

������������ ��������� � ����� ����������� ��������.
���� �������� `shape` �� �������, �� ����� �������������� ������� ����

#### ������
	// ��, ��� �� ��������� ����� - �� ����������
	context.clip(new Circle(100, 100, 50));
	context.fillRect(100, 100, 100, 100);

## ����� rotate

	[this] rotate(number angle);
	[this] rotate(number angle, LibCanvas.Point pivot);

## ����� translate

	[this] translate (LibCanvas.Point point)
	[this] translate (LibCanvas.Point point, boolean reverse)
	[this] translate (int x, int y)

## ����� text
	[this] text(object params)

#### �����

`text`       (*string*)

`color`      (*string*)

`wrap`       (*string*) no|normal

`to`         (*LibCanvas.Shapes.Rectangle*) ��-��������� ���������� ����� this.getFullRectangle

`align`      (*string*) center|left|right

`size`       (*int, ��-��������� = 16*)

`weigth`     (*string*) bold|normal

`style`      (*string*) italic|normal

`family`     (*string*, ��-��������� = sans-serif)

`lineHeight` (*int*)

`overflow`   (*string*, ��-��������� = visible) hidden|visible

`padding`    (*int|int[]*, ��-��������� = 0) [topBottom, leftRight]

## ����� drawImage
	[this] drawImage(element image)
	[this] drawImage(object params)


#### �����

��������� ������ ���� �� ����� `from`, `center`, `draw`

`image`  (*element*) ��������, ������� �� ���������� ������������

`from`   (*LibCanvas.Point*) ������� ����� �����, ������ ������������ ��������

`center` (*LibCanvas.Point*) ����������� �����, ������ ������������ ��������

`draw`   (*LibCanvas.Shapes.Rectangle*) �������������, � ������� ���������� ��������. �������� ��������� �� �������� ��������������.

`crop`   (*LibCanvas.Shapes.Rectangle*) �������������, ������� ��������� �� ����� ��������, ������� ����� �������� (����������� ������ ��� ������������� draw)

`angle`  (*int*) ���� ������� �������� � ��������

`scale`  (*LibCanvas.Point*) ������ ��������. ����� �������������� ��� ��������� �������� �� ��������� ��� ������������

������� ������� - ���� ���� `draw` � `crop`, �� ������� ����������� `crop` � ��������, ����� ��� ����������� �������� `from|center|draw`, ����� ��������������� ������ ������ �� ���� angle �� ������� ������� � ��� ��������������.

#### ������
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

## ����� projectiveImage
###### testing

	[this] projectiveImage(object params)

## ����� getPixel
	[this] getPixel(LibCanvas.Point point)

���������� �������� ����� ������� � ����� point � ������� {r: [0, 255], g: [0, 255], b: [0, 255], a: [0, 1]}
�������� ����� �������� ������������ Color.

#### ������

	mouse.events.add( 'click', function () {
		var pixel = ctx.getPixel( mouse.point );
		trace( new atom.Color( pixel ) );
	});

	mouse.events.add( 'click', function () {
		var pixel = ctx.getPixel( mouse.point );

		pixel.a > 0.1 ?
			alert('������� �����')  :
			alert('������� �������');
	});

## ����� createGradient
	[RadialGradient] createGradient(Circle from, Circle to, Object colors)
	[LinearGradient] createGradient(Point  from, Point  to, Object colors)
	[LinearGradient] createGradient(Rectangle rect, Object colors)

������ � ���������� ���������� ��� ��������� �������� � ����-�������, ���������� � colors

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

## ����� createRectangleGradient

	//// todo

# ��������� ������ ��������� ������ �� ������������� ���������:
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