LibCanvas.Shapes.Circle
=======================

`LibCanvas.Shapes.Circle` - �����, ������� ��������� ������� �������������� ������ "����"

#### Global

����� ������ LibCanvas.extract() ����� ������������ �������� ����� "Circle"

## �������� ���������� LibCanvas.Shapes.Circle

	var circle = new LibCanvas.Shapes.Circle( centerX, centerY, radius );

	var circle = new LibCanvas.Shapes.Circle( centerPoint, radius );

	var circle = new LibCanvas.Shapes.circle({
		center : centerPoint,
		radius : toPoint
	});

�� ��������� ��� �������� �������� �� ������:

	var circle = new LibCanvas.Shapes.Circle( point, 10 );
	circle.center.x = 100;
	alert(point.x); // 100

���� ����������, ������ ��������� ����� ��������, ��������� ���� �����
	var circle = new LibCanvas.Shapes.Circle( center.clone(), radius );

## ��������

### radius
������ �����

### center
������ �� ����� - ����� �����

## ����� hasPoint

	bool hasPoint(LibCanvas.Point point);

���������� true ���� ����� ��������� ������ �����

#### ������
	var circle = new LibCanvas.Shapes.Circle({
		center : [25, 25],
		radius : 15
	});
	circle.hasPoint( [22, 24] ); // true
	circle.hasPoint( [88, 88] ); // false

## ����� move

	LibCanvas.Shapes.Circle move(LibCanvas.Point distance, bool reverse);

�������� ����� move � ������

#### ������
	var line = new LibCanvas.Shapes.Line({
		from : [4, 4],
		to   : [8, 8]
	});
	line.move({ x : 2, y : 3 });
	// line.from == Point( 6,  7)
	// line.to   == Point(10, 11)

#### ���������� `this`

## ����� scale

	LibCanvas.Shapes.Circle scale(Number factor, LibCanvas.Point pivot);

�������� ������ ����� � `factor` ��� ������������ `pivot` ��� ������, ���� `pivot` �� �������.

	var circle = new Circle( 100, 100, 12 );
	circle.scale( 2 );
	console.log( circle.radius ); // 24;

#### ���������� `this`

## ����� intersect

	LibCanvas.Shapes.Circle intersect(LibCanvas.Shapes.Circle circle);

��������� ��� ����� �� ������� �����������:

	var foo = new Circle( 10, 10, 30 ),
	    bar = new Circle( 20, 20, 30 ),
	    qux = new Circle( 90, 90, 30 );

	console.log( foo.intersect(bar) ); // true
	console.log( foo.intersect(qux) ); // false

## ����� processPath

	LibCanvas.Context2D processPath(LibCanvas.Context2D ctx, bool noWrap = false)

������������ ��������������� ���� � ������� `arc`


	new Circle(50, 40, 30).processPath(ctx);
	// ����������� c:
	ctx
		.beginPath()
		.arc(50, 40, 30, 0, (360).degree(), false )
		.closePath()

	// � �����:
	new Circle(50, 40, 30).processPath(ctx, true);
	// ����������� c:
	ctx.arc(50, 40, 30, 0, (360).degree(), false );

## ����� equals

	bool equals(LibCanvas.Shapes.Circle rect, int accuracy)

���������� ������ ������ ������� LibCanvas.Point.equals, � ����� �������

	var foo = new LibCanvas.Shapes.Circle(15, 20, 10);
	var bar = new LibCanvas.Shapes.Circle(15, 20, 10);

	trace(bar == foo);      // false
	trace(bar.equals(foo)); // true

## ����� clone
	LibCanvas.Shapes.Circle clone()

���������� ���� � ������ �� �������� � ������������ ������

	var circ  = new Circle(30, 20, 10);
	var clone = circ.clone();

	trace(circ == clone);      // false
	trace(circ.equals(clone)); // true
