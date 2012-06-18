LibCanvas.Point3D
=================

`LibCanvas.Point3D` - �����, ������� ��������� ����� � ��������� ������������.

#### Global

����� ������ LibCanvas.extract() ����� ������������ �������� ����� "Point3D"

## �������� ���������� LibCanvas.Point3D

	
������� ��������� ������ `LibCanvas.Point` ����� ����� �� ��������� ��������:

	var xCoord = 15, yCoord = 20, zCoord = 25;

	// ������� � ����������� ����������
	var point = new LibCanvas.Point3D( xCoord, yCoord, zCoord );

	// ������ ���������
	var point = new LibCanvas.Point3D([xCoord, yCoord, zCoord]);

	// ������ ���������
	var point = new LibCanvas.Point3D({ x : xCoord, y : yCoord, z: zCoord });

	// ������ ������ LibCanvas.Point3D
	var point = new LibCanvas.Point3D(anotherPoint);
	
	// ��� ����������� �
	var point = anotherPoint.clone();

	// ����� ������������� LibCanvas.extract():
	var point = new Point3D( xCoord, yCoord, zCoord );


## ����� equals

	boolean equals(LibCanvas.Point3D to, int accuracy)

����� ���������� ��� ����� �� �� �������

#### �������� `accuracy`
	���� ������, �� �������� ���������� ������, � ��������� ������� ����� ����������� ����� (��� ��������� ���������)

#### ������
	var bar = new LibCanvas.Point3D(15, 15, 10);
	var foo = new LibCanvas.Point3D(15, 15, 10);

	trace(bar == foo);      // false
	trace(bar.equals(foo)); // true

#### ������ � accuracy
	var bar = new LibCanvas.Point3D(7, 12.88888324, 15.1111127);
	var foo = new LibCanvas.Point3D(7, 12.88888115, 15.1111093);
 
	console.log(bar == foo);         // false
	console.log(bar.equals(foo));    // false
	console.log(bar.equals(foo, 8)); // false
	console.log(bar.equals(foo, 4)); // true

## ����� clone

	LibCanvas.Point3D clone()

���������� ����� � ������ �� ������������

#### ������
	var point = new LibCanvas.Point3D(15, 15, 10);
	var clone = point.clone();
	console.log(point == clone); // false
	console.log(point.equals(clone)); // true
	
## ����� move

	LibCanvas.Point move(LibCanvas.Point point3d)

#### ������
	var point    = new LibCanvas.Point3D(10, 10, 10);
	var distance = new LibCanvas.Point3D( 5, -3,  1);
	
	point.move(distance); // Point3D(15, 7, 11)

## ����� diff

	LibCanvas.Point3D diff(LibCanvas.Point3D point)

���� ����� �������� �������� ��������� :
�� ������� ���� ���������� �����, ����� ��� ��������� �� ����� ���, ������� �������� ������ ����������

#### ������
	var pO = new LibCanvas.Point3D(10, 10, 7);
	var pA = new LibCanvas.Point3D(15, 18, 7);

	pA.diff(pO); // Point3D(-5, -8, 0)

## ����� map

	LibCanvas.Point3D map(callback, context)

�������� �������� ����� �������� ���������� ������ callback

#### ������
	var point = new LibCanvas.Point3D(1, 2, 3);
	
	point.map(function (value, coord, point) {
		return value * value;
	});
	
	atom.trace( point ); // Point3D(1, 4, 9)
	
## ����� add

	LibCanvas.Point3D add(value)

��������� �������� ���� ��������� ����� �� `value`

#### ������
	var point = new LibCanvas.Point3D(1, 2, 3);
	
	point.add(5);
	
	atom.trace( point ); // Point3D(6, 7, 8)
	
## ����� mul

	LibCanvas.Point3D mul(value)

�������� �������� ���� ��������� ����� �� `value`

#### ������
	var point = new LibCanvas.Point3D(1, 2, 3);
	
	point.mul(5);
	
	atom.trace( point ); // Point3D(5, 10, 15)