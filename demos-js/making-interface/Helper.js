(function () {

var R = $random;
var S = LibCanvas.Shapes;

Interface.Helper = new Class({
	initialize : function (libcanvas) {
		this.libcanvas = libcanvas;
	},
	create : function (shape, z) {
		var elem = new Interface.Shape()
			.setShape(
				shape.bind('moved', this.update())
			)
			.setZIndex(z || 0)
			.bind('statusChanged', this.update())
		this.libcanvas.addElement(elem);
		return elem;
	},
	update : function () {
		return updateCanvas(this.libcanvas);
	},
	randomPoint : function () {
		return new LibCanvas.Point(
			R(30, this.libcanvas.elem.width-30), R(30,  this.libcanvas.elem.height-30)
		);
	},
	createRandom : function (type, z) {
		z = $chk(z) ? z : R(1, 999);
		var types = {
			rect : 3, circle : 1, poly : 2
		};
		switch(types[type] || R(0, 7)) {
			case 0 :
			case 1 :
				return this.create(
					new S.Circle({
						center : this.randomPoint(),
						radius : R(20, 60)
					}), z
				)
			case 2 :
				var start = this.randomPoint();
				return this.create(
					new S.Polygon([	start,
						new LibCanvas.Point(
							start.x + R(30, 80),
							start.y + R(30, 80)
						),
						new LibCanvas.Point(
							start.x + R(30, 80),
							start.y - R(30, 80)
						)
					]), z
				)
			default:
				return this.create(
					new S.Rectangle({
						from : this.randomPoint(),
						size : [R(20, 60), R(20, 60)]
					}), z
				)
		}
	},
	draggable : function (elem) {
		return elem
			.listenMouse()
			.clickable()
			.draggable();
	},
	createRandomDraggable : function (type, z) {
		return this.draggable(
			this.createRandom(type, z)
		);
	},
	createDraggable : function (shape, z) {
		return this.draggable(
			this.create(shape, z)
		);
	},
});

})();