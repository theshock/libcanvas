�������� ����� ����������
=========================

��������� ��������� HTMLCanvasElement ��������� ����� ��������� ���� ��������� ��� ������ LibCanvas.
���������� ������� `HTMLCanvasElement.addContext(name, ContextClass)`, ��� `ContextClass` - ��� ����� � �������������, ����������� ������ ���������� ������ �� ������� canvas.

#### ������
	new function () {

		var ContextClass = atom.declare({
			initialize: function (canvas) {
				this.canvas = canvas;
				this.ctx2d  = canvas.getContext('2d');
			},
			welcome: function () {
				this.ctx2d.fillText('Hello World', 0, 0);
			}
		});

		HTMLCanvasElement.addContext('2d-hello', ContextClass);
	}

#### �������������:
	var myContext = canvas.getContext('2d-hello');
	myContext.welcome();
	myContext.fillRect(0, 0, 10, 10); // Error

������ ������������ �������� �� �����������, ������ `fillRect` ������ ������.
����� ������� ������ �������� ����� - �������������� �� ��������� LibCanvas.
�������� �������� - ����������� �� ������������ �� ������������� `LibCanvas.Context2D`, ������ ���������� ����������� ������.

#### ������
	new function () {
		var HelloContextClass = atom.declare( LibCanvas.Context2D, { 
			welcome: function () {
				return this.ctx2d.fillText('Hello World', 0, 0);
			}
		});

		HTMLCanvasElement.addContext('2d-libcanvas-hello', HelloContextClass);
	}

#### �������������:
	var myContext = canvas.getContext('2d-libcanvas-hello');
	myContext.welcome();
	myContext.fillRect(0, 0, 10, 10); // Success

���������� � �������� ��������� �������� ����������� ������� ��������, ����� ����.

#### Canvas2DContext
�� ������ ������������ `Canvas2DContext` �� ������ `Additions` ��� �������� ������ ��������� �� ���� ��������� (� ����������� ������� �����������)

	new function () {
	
		var HelloContextClass = atom.declare( LibCanvas.Canvas2DContext, {
			welcome: function () {
				return this.ctx2d.fillText('Hello World', 0, 0);
			}
		});

		HTMLCanvasElement.addContext('2d-hello', HelloContextClass);
	}

#### �������������:
	var myContext = canvas.getContext('2d-hello');
	myContext.welcome();
	myContext.fillRect(0, 0, 10, 10); // Success

### ��������!
������ �� ������������� �������������� ���������� � ������� ��������� (������� ��-����� ����� �������� ����� ����� `getOriginalContext`), �.�. ��� �������� � ���������� ����� ����������� ���������.
��� �� �� ������������� �������������� �������� `2d-libcanvas`



