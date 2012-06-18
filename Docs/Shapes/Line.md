LibCanvas.Shapes.Line
=====================

#### Global

����� ������ LibCanvas.extract() ����� ������������ �������� ����� "Line"

## �������� ���������� LibCanvas.Shapes.Line

	// ��� ����� LibCanvas.Point - ������ � ����
	var line = new LibCanvas.Shapes.Line( fromPoint, toPoint );

	// ������ ����������
	var line = new LibCanvas.Shapes.Line({
		from : fromPoint,
		to   : toPoint
	});

�� ���������, ��� ����� ���������� �� ������, ������ ���� �� �������� line ����� ��� ����� �� ��� ��������� ����� ������ ����� ����� ������� � ������������ �����.

	var line = new Line( fromPoint, toPoint );
	line.from.x = 100;
	alert(fromPoint.x); // 100

���� ����������, ������ ��������� ����� ��������, ��������� ����� �����
	var line = new LibCanvas.Shapes.Line( fromPoint.clone(), toPoint.clone() );

��� �������� �����:
	var line = new LibCanvas.Shapes.Line( fromPoint, toPoint ).clone();

## ��������

### length (get)
�������� ����� �����

### center (get)
������� ����� ����� � ������������, ������� ������������� ������ �����

	var line = new Line({
		from : [10, 10],
		to   : [20, 20]
	});
	line.center; // Point(15, 15)

## ����� hasPoint

	bool hasPoint(LibCanvas.Point point);

���������� true ���� ����� ��������� �� �����

#### ������
	var line = new LibCanvas.Shapes.Line({
		from : [4, 4],
		to   : [8, 8]
	});
	line.hasPoint( [6, 6] ); // true
	line.hasPoint( [2, 5] ); // false

## ����� move

	LibCanvas.Shapes.Line move(LibCanvas.Point distance, bool reverse);

�������� ����� move � ����� �����

#### ������
	var line = new LibCanvas.Shapes.Line({
		from : [4, 4],
		to   : [8, 8]
	});
	line.move({ x : 2, y : 3 });
	// line.from == Point( 6,  7)
	// line.to   == Point(10, 11)

#### ���������� `this`

## ����� processPath

	LibCanvas.Context2D processPath(LibCanvas.Context2D ctx, bool noWrap = false)

������������ ���� � ������� � ����� `from` � ������� `ctx.moveTo` � ����� `to` � ������� `ctx.lineTo`

#### �������� `noWrap`
���� ������ � false(�� ���������), �� ��������� � ������� beginPath, endPath

#### ������
	LibCanvas.Shapes.Line({
		from : [4, 4],
		to   : [8, 8]
	}).processPath(ctx);

	// ����������� c:
	ctx.beginPath()
	   .moveTo(4, 4) // line.from
	   .lineTo(8, 8) // line.to
	   .closePath();

#### ���������� `this`

## ����� perpendicular

	LibCanvas.Point perpendicular(LibCanvas.Point point)

���������� ������������� ����� `point` �� ������� ������

#### ������
	var line  = new LibCanvas.Shapes.Line( [0,3], [4,0] );
	var point = new LibCanvas.Point( 0, 0 );

	line.perpendicular( point ); // Point(1.44, 1.92)


## ����� intersect

	bool intersect(LibCanvas.Shapes.Line line)
	LibCanvas.Point intersect(LibCanvas.Shapes.Line line, true)

���������� ����������� ����� � ������ ������. ���� �������� `point` ����� `true`, �� ������� ����� ����������� ��� `null`, ���� ����������� - ������� `true` ��� `false`.

   var first  = new Line([10, 10], [20, 20]);
   var second = new Line([10, 20], [20, 10]);

   trace( first.intersect(second      ) ); // true
   trace( first.intersect(second, true) ); // Point(15, 15)


## ����� distanceTo

	Number distanceTo(LibCanvas.Point point, boolean asInfinitiveLine)

���������� ���������� ����� ������ � ������ `point`. ���� `asInfinitiveLine=true`, �� ����� ����� ���������� ����������� ������, ����� - ��������.

	var line  = new Line (10, 10, 20, 20),
	    point = new Point(41, 40);

	line.distanceTo(point      ); // 29
	line.distanceTo(point, true); // 0.7071


## ����� equals
	bool equals(LibCanvas.Shapes.Line line, int accuracy)

���������� ����� ����� ������� LibCanvas.Point.equals

	var foo = new LibCanvas.Shapes.Line(15, 20, 10, 5);
	var bar = new LibCanvas.Shapes.Line(15, 20, 10, 5);

	trace(bar == foo);      // false
	trace(bar.equals(foo)); // true

## ����� clone
	LibCanvas.Shapes.Line clone()

���������� ����� � ������ �� ������������

	var line  = new LibCanvas.Shapes.Line(15, 20, 10, 5);
	var clone = line.clone();

	trace(line == clone);      // false
	trace(line.equals(clone)); // true