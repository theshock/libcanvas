LibCanvas.Point
===============

`LibCanvas.Point` - ���� �� ������� � ���������� LibCanvas. �� ��� �������� ������ ����������, ������� ������, ��������� ����������.

#### Global

����� ������ LibCanvas.extract() ����� ������������ �������� ����� "Point"

## �������� ���������� LibCanvas.Point
������� ��������� ������ `LibCanvas.Point` ����� ����� �� ��������� ��������:

	var xCoord = 15, yCoord = 20;

	// ������� � ����������� ����������
	var point = new LibCanvas.Point( xCoord, yCoord );

	// ������ ���������
	var point = new LibCanvas.Point([xCoord, yCoord]);

	// ������ ���������
	var point = new LibCanvas.Point({ x : xCoord, y : yCoord });

	// ������ ������ LibCanvas.Point
	var point = new LibCanvas.Point(anotherPoint);
	
	// ��� ����������� �
	var point = anotherPoint.clone();

	// ����� ������������� LibCanvas.extract():
	var point = new Point( xCoord, yCoord );


## ����� equals

	boolean equals(LibCanvas.Point to, int accuracy)

����� ���������� ��� ����� �� �� �������

#### �������� `accuracy`
	���� ������, �� �������� ���������� ������, � ��������� ������� ����� ����������� ����� (��� ��������� ���������)

#### ������
	var bar = new LibCanvas.Point(15, 15);
	var foo = new LibCanvas.Point(15, 15);

	trace(bar == foo);      // false
	trace(bar.equals(foo)); // true

#### ������ � accuracy
	var bar = new LibCanvas.Point(12.88888324, 15.1111127);
	var foo = new LibCanvas.Point(12.88888115, 15.1111093);
 
	console.log(bar == foo);         // false
	console.log(bar.equals(foo));    // false
	console.log(bar.equals(foo, 8)); // false
	console.log(bar.equals(foo, 4)); // true

## ����� clone

	LibCanvas.Point clone()

���������� ����� � ������ �� ������������

#### ������
	var point = new LibCanvas.Point(15, 15);
	var clone = point.clone();
	console.log(point == clone); // false
	console.log(point.equals(clone)); // true

## ����� move

	LibCanvas.Point move(LibCanvas.Point distance, boolean reverse = false)

#### ������
	var point    = new LibCanvas.Point(10, 10);
	var distance = new LibCanvas.Point(5, -3);
	
	point.move(distance, false); // Point(15, 7)
	point.move(distance, true ); // Point(5, 13)

#### ���������� `this`


## ����� moveTo

	LibCanvas.Point moveTo(LibCanvas.Point point)

#### ������
	var start  = new LibCanvas.Point(100, 100);
	var finish = new LibCanvas.Point(800, 800);
	// ������ ���������� ����� � �����
	start.moveTo(finish);

#### ���������� `this`


## ����� angleTo

	int angleTo(LibCanvas.Point point)

#### ������
	var pO = new LibCanvas.Point(10, 10);
	var pA = new LibCanvas.Point(15, 15);

	var angle = pA.angleTo(pO); // 0.785 (� ��������)
	angle.getDegree() == 45; // � ��������


## ����� distanceTo

	int distanceTo(LibCanvas.Point point)

#### ������
	var pO = new LibCanvas.Point(10, 10);
	var pA = new LibCanvas.Point(15, 15);

	pA.distanceTo(pO); // 7.071

## ����� diff

	LibCanvas.Point diff(LibCanvas.Point point)

���� ����� �������� �������� ��������� :
�� ������� ���� ���������� �����, ����� ��� ��������� �� ����� ���, ������� �������� ������ ����������

#### ������
	var pO = new LibCanvas.Point(10, 10);
	var pA = new LibCanvas.Point(15, 18);

	pA.diff(pO); // Point(-5, -8)


## ����� rotate

	LibCanvas.Point rotate(int angle, LibCanvas.Point pivot = {x:0, y:0})

��������� ����� �� angle �������� ������ ��� pivot

#### ������
	var pO = new LibCanvas.Point(10, 10);
	var pA = new LibCanvas.Point(20, 10);

	pA.rotate((90).degree(), pO); // Point(10, 20)

#### ���������� `this`

## ����� scale

	LibCanvas.Point scale(int power, LibCanvas.Point pivot = Point(0, 0))

����������� ���������� �� ����� `pivot` � `power` ���

#### ������
	var pO = new LibCanvas.Point(10, 10);
	var pA = new LibCanvas.Point(20, 15);
	pA.scale(2, pO); // Point(30, 20)


#### ���������� `this`

## ����� getNeighbour

	LibCanvas.Point scale(string direction)

���������� �������� � ������� �����.

#### �������� `direction`
����� ��������� ���� �� ��������� ��������:

`t`  - ���������� ����� ������

`r`  - ���������� ����� ������

`b`  - ���������� ����� �����

`l`  - ���������� ����� �����

`tl` - ���������� ����� ������-�����

`tr` - ���������� ����� ������-������

`bl` - ���������� ����� �����-�����

`br` - ���������� ����� �����-������

#### ������
	var pA = new LibCanvas.Point(15, 15);
	pA.getNeighbour('t');   // Point(15, 14)
	pA.getNeighbour('bl');  // Point(14, 16)

## ����� toObject

	Object toObject()

���������� ��� � ������������ �����

#### ������
	var bar = new LibCanvas.Point(12, 15);
	var foo = bar.toObject();
	// ���������� foo = { x : 12, y : 15 }