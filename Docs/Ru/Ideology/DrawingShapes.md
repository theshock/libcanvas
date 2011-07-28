Отрисовка фигур
===============

Отрисовка фигур по своей идеологии подобна к отрисовке картинок. Важно помнить, что сами по себе фигуры из набора `LibCanvas.Shapes.*` не имеют внешнего вида - цвета, толщины линий, непрозрачности. Это абстрактные математические сущности. Для того, чтобы они приобрели вид - необходимо их отрисовать вручную или при помощи специально обученного объекта.

Самый простой способ отрисовать любую фигуру - это передать её в качестве первого аргумента методам `stroke` или `fill` контекста LibCanvas:

	LibCanvas.extract();
	var context = canvas.getContext( '2d-libcanvas' );
	context.fill( new Circle( 100, 100, 20 ), 'red' );
	context.stroke(
		new Polygon([
			[100, 100],
			[200, 100],
			[100, 200]
		], 'blue' ));

Но такой способ не подходит для покадровой отрисовки и реакции на действия пользователя. Для того, чтобы сделать фигуры с откликом стоит использовать `LibCanvas.Ui.Shaper`, который можно легко создать при помощи метода `createShaper` у `libcanvas`. Этот метод реализует такие поведения, как `Drawable`, `Animatable`, `Clickable`, `Draggable`, `Droppable`, `Linkable`, `MouseListener`, `Moveable`. Ему необходимо передать вашу фигуру, стиль для отрисовки и вызвать инициировать необходимые поведения:

	libcanvas.createShaper({
		shape: new Circle( 100, 100, 20 ),
		fill : 'red',
		// меняем стиль круга при наведении
		hover: {
			fill  : 'black',
			stroke: 'red'
		},
	})
	// активируем реакцию на наведение мыши
	.clickable()
	// делаем его переносимым
	.draggable()
	// заставляем его почучуть наращивать радиус фигуры
	.animate({
		time : 20000,
		props: { 'shape.radius': 50 },
		onProcess: libcnavas.update
	});

`LibCanvas.Ui.Shaper` - это всего-лишь обычный `Drawable` элемент и, если вам необходимо сделать поведение или отображение, отличное от `LibCanvas.Ui.Shaper` - достаточно создать соответствующий объект.


	LibCanvas.extract();
	var MyShaper = atom.Class({
		Extends: Drawable,

		initialize: function (rectangle) {
			this.shape  = Rectangle( rectangle );
			this.circle = new Circle( this.shape.center, 10 );
		},

		draw: function () {
			this.libcanvas.ctx
				.stroke( this.shape , 'black' )
				.fill  ( this.circle, 'red'   );
		}
	});

	libcanvas.addElement( new MyShaper([ 5, 5, 20, 20 ]) );
