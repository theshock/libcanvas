LibCanvas
=========

`LibCanvas` - ��� ���������� ������, ������� �������� ������ ������������ ��� ����������. �� �������� ��������� ����������� �������


## ����������� ����� extract

	object LibCanvas.extract(object to = window)

��������� ������� ��������� ������ LibCanvas � ���������� ������������ ���� (��� � ��������� ������) ��� ����� �������� ������
	
#### ������

	// ����������� ������:
	var circle = new LibCanvas.Shapes.Circle(100, 100, 20);

	// ��������� � ��������� ����������
	var LC = LibCanvas.extract({});
	var circle = new LC.Circle(100, 100, 20);
	
	// ��������� � ���������� ������������ ����:
	LibCanvas.extract();
	var circle = new Circle(100, 100, 20);

## ����������� ����� buffer

	canvasElement LibCanvas.buffer(int width, int height, bool withCtx)
	canvasElement LibCanvas.buffer(LibCanvas.Size size, bool withCtx)

������� � ���������� ������� Canvas �������� width*height.
���� withCtx �������, �� �������� `ctx` �������� ����� ����� ��������� '2d-libcanvas'


#### ������
	var buffer = LibCanvas.buffer(100, 100, true);
	buffer.ctx.fillAll('black');

	libcanvas.ctx.drawImage(buffer, 10, 10);
	