LibCanvas.Shapes.Rectangle
==========================

`LibCanvas.Shapes.Rectangle` - ������� ������ � LibCanvas, ������� ������������ � ��� ����� � ��������� ������ (�������� � `ctx.drawImage`)

#### Global

����� ������ LibCanvas.extract() ����� ������������ �������� ����� "Rectangle"

## �������� ���������� LibCanvas.Shapes.Rectangle

	// ���������� ������ ����� � �������
	var rect = new LibCanvas.Shapes.Rectangle( xFromCoord, yFromCoord, width, height );

	// ��� ����� LibCanvas.Point - ������ � ����
	var rect = new LibCanvas.Shapes.Rectangle( fromPoint, toPoint );

	// ����� LibCanvas.Point - ������ � ������ LibCanvas.Size
	var rect = new LibCanvas.Shapes.Rectangle( fromPoint, size );

	// ������ ���������� (������ ���� ��� ����� ��������� �� ����, ��������, from � size)
	var rect = new LibCanvas.Shapes.Rectangle({
		from : fromPoint,
		to   : toPoint,
		size : size
	});

�� ������ ������������������ � ����� ����������, LibCanvas ����� ������ � ����� ������������� ��� ��, ��� �� ������. �� ������ ��������� � ����:

	var rect = new LibCanvas.Shapes.Rectangle(
		new LibCanvas.Point(5, 10),
		new LibCanvas.Size(15, 20);
	);
	var rect = new LibCanvas.Shapes.Rectangle({
		from : [5, 10],
		size : {
			width  : 15,
			height : 20
		}
	});
	var rect = new LibCanvas.Shapes.Rectangle({
		to : new LibCanvas.Point(20, 30),
		size : [15, 20]
	});

�� ���������, ��� ����� ���������� �� ������, ������ ���� �� �������� rectangle ����� ��� ����� �� ��� ��������� ����� ������ �������������� ����� ������� � ������������ �����. � ���� �������� ����� ������ ��������� �������� ������

	var rect = new LibCanvas.Shapes.Rectangle( fromPoint, toPoint );
	rect.from.x = 100;
	atom.trace(fromPoint.x); // 100

���� ����������, ������ ��������� ����� ��������, ��������� ����� �����

	var rect = new LibCanvas.Shapes.Rectangle( fromPoint.clone(), toPoint.clone() );

��� �������� ��������:

	var rect = new LibCanvas.Shapes.Rectangle( fromPoint, toPoint ).clone();

## ��������

### width (set/get)
�������� ������ �������������� ��� �������� (������� ����� to �� ���������� x)

### height (set/get)
�������� ������ �������������� ��� �������� (������� ����� to �� ���������� y)

### bottomLeft (get)
������� ����� ����� � ������������, ������� ������������� ������ ������� ���� ��������������

### topRight (get)
������� ����� ����� � ������������, ������� ������������� ������� �������� ���� ��������������

### center (get)
������� ����� ����� � ������������, ������� ������������� ������ ��������������

### size (set/get)
��������/���������� ������ � ������ �������������� � ������� {width, height}

## ����� hasPoint

	bool hasPoint(LibCanvas.Point point, int padding);

���������� true ���� ����� ��������� ������ ��� �� ������� ��������������

#### �������� `padding`
	��������� ������� �� �������

#### ������
	var rect = new LibCanvas.Shapes.Rectangle({
		from : [ 4,  4],
		to   : [10, 10]
	});
	rect.hasPoint( [6, 6] ); // true
	rect.hasPoint( [2, 2] ); // false
	rect.hasPoint( [3, 3], 2 ); // false

## ����� align

	LibCanvas.Shapes.Rectangle align(LibCanvas.Shapes.Rectangle rect, string sides);

����������� ������������� ������������ ������� ��������������. sides ����� ��������� top/middle/bottom ��� left/center/right

	// ���������� ������������� ������������ ������
	rectangle.align( context.rectangle, 'center middle' ), 'red'

## ����� move

	LibCanvas.Shapes.Rectangle move(LibCanvas.Point distance, bool reverse);

�������� ����� move � ����� �����

#### ������
	var rect = new LibCanvas.Shapes.Rectangle({
		from : [4, 4],
		to   : [8, 8]
	});
	rect.move({ x : 2, y : 3 });
	// rect.from == Point( 6,  7)
	// rect.to   == Point(10, 11)

#### ���������� `this`

## ����� draw

	LibCanvas.Shapes.Rectangle draw(LibCanvas.Context2D ctx, String type);

������������ ������������� � ��������, ��������� ������� ���������

#### �������� `type`
	������ ���������. ����� ��������� �������� `fill`, `stroke`, `clear`

#### ������
	var rect = new LibCanvas.Shapes.Rectangle(10, 10, 5, 5);
	var ctx  = canvasElem
		.getContext('2d-libcanvas')
		.set({
			'fillStyle': 'red',
			'strokeStyle': 'black'
		});
	// ������ ������� ������������� � ���������
	rect.draw(ctx, 'fill');
	// ������� ������ ������������� � ���������
	rect.draw(ctx, 'stroke');

�� ����� ������ ������������� ������������ ������ ���� �� ����� ���� ������� �� �������� ���������:

	var ctx  = canvasElem
		.getContext('2d-libcanvas')
		.fill  (rect, 'red')
		.stroke(rect, 'black');


## ����� moveTo

	LibCanvas.Shapes.Rectangle moveTo(LibCanvas.Shapes.Rectangle rect)

���������� ������� ������������� ���, ����� �� ���� ����� ��������������, ����������� ����������


	var Rectangle = LibCanvas.Shapes.Rectangle;
	var rectFrom = new Rectangle({
		from : [10, 10],
		to   : [20, 20]
	});
	var rectTo   = new Rectangle({
		from : [15, 15],
		to   : [25, 25]
	});
	rectFrom.moveTo(rectTo);

	rectFrom.from; // Point(15, 15);
	rectFrom.to  ; // Point(25, 25);

#### ���������� `this`

## ����� processPath

	LibCanvas.Context2D processPath(LibCanvas.Context2D ctx, bool noWrap = false)

�������� ���� � ������� `ctx.moveTo`, `ctx.lineTo` ������� � ����� `from` �� ������� �������

#### �������� `noWrap`
���� ������ � false(�� ���������), �� ��������� � ������� beginPath, endPath

#### ������
	LibCanvas.Shapes.Rectangle({
		from : [4, 5],
		to   : [8, 9]
	}).processPath(ctx);

	// ����������� c:
	ctx.beginPath()
	   .moveTo(4, 5) // rect.from
	   .lineTo(4, 9) // topRight
	   .lineTo(8, 9) // rect.to
	   .lineTo(8, 5) // bottomLeft
	   .lineTo(4, 5) // rect.from
	   .closePath();

## ����� getRandomPoint

	LibCanvas.Point getRandomPoint(int margin = 0);

���������� ��������� �����, ����������� ������ ��������������

#### �������� `margin`
���� ������, �� ����� ����� ���������� � ������ ��������

#### �������
	var rect = LibCanvas.Shapes.Rectangle({
		from : [10, 10],
		to   : [90, 90]
	});

	// ������ ��������� �����, � ������� ���������� ����� ����� 10 � 90
	rect.getRandomPoint();    // �������� Point(53, 87)

	// ������ ��������� �����, � ������� ���������� ����� ����� 40(10+30) � 60(90-30)
	rect.getRandomPoint( 30); // �������� Point(49, 43)

	// ������ ��������� �����, � ������� ���������� ����� ����� -20(10-30) � 120(90+30)
	rect.getRandomPoint(-30); // �������� Point(96, -5)
	

## ����� equals

	bool equals(LibCanvas.Shapes.Rectangle rect, int accuracy)

���������� ����� ��������������� ������� LibCanvas.Point.equals

	var foo = new LibCanvas.Shapes.Rectangle(15, 20, 10, 5);
	var bar = new LibCanvas.Shapes.Rectangle(15, 20, 10, 5);

	trace(bar == foo);      // false
	trace(bar.equals(foo)); // true

## ����� clone
	LibCanvas.Shapes.Rectangle clone()

���������� ������������� � ������ �� ������������

	var rect  = new LibCanvas.Shapes.Rectangle(15, 20, 10, 5);
	var clone = rect.clone();

	trace(rect == clone);      // false
	trace(rect.equals(clone)); // true