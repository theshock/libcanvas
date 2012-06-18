LibCanvas.Mouse
===============

`LibCanvas.Mouse` ������������� ��������� ��� ����������� ���������� �����

#### Global

����� ������ LibCanvas.extract() ����� ������������ �������� ����� "Mouse"

## ����������� ��������

#### ����� prevent

����� ������������, ����� ��������� ������� ���� ��-���������:

	window.onclick = Mouse.prevent;

#### ����� getOffset

	LibCanvas.Point getOffset( MouseEvent e, DOMElement element )

���������� ��������� ���� ������������ ��������

	var offset = Mouse.getOffset( event, canvas );
	
## �������� ���������� LibCanvas.Mouse

������ ���������� ��������� �������, ������� �������� ���� �������. 

	var mouse = new LibCanvas.Mouse( myCanvas );
	

## ��������

`point` - `LibCanvas.Point`, � �������� ������������ ���� ������������ ������ ��������

`previous` - `LibCanvas.Point`, ���������� ���������� ���� ������������ ������ ��������

`delta` - `LibCanvas.Point`, ��������� �������� ��������� ����

`events` - ������ `atom.Events`

## �������

* click
* dblclick
* contextmenu
* wheel
* over
* out
* down
* up
* move

#### ������

	mouse.events.add( 'click', function (event, mouse) {
		// �������� ���� �������� 10 �������� � ����� �����:
		canvas.ctx.fill(
			new Circle( mouse.point, 10 )
		);
	});

#### �����������

������� `wheel` ����� �������������� �������� `delta`, �������� ���������� ����������� �������� ������� - "-1" ��� "1".

