window.App = window.App || {};


(function () {

var R = window.$random;
var S = LibCanvas.Shapes;

App.Start = {
	create : function (shape, z) {
		var elem = new App.TestElem()
			.setShape(shape)
			.setZIndex(z || 1);
		this.canvas.addElement(elem);
		return elem;
	},
	randomPoint : function () {
		return new LibCanvas.Point(
			R(10, 890), R(10, 590)
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
						radius : R(20, 100)
					}), z
				)
			case 2 :
				return this.create(
					new S.Polygon([
						this.randomPoint(),
						this.randomPoint(),
						this.randomPoint()
					]), z
				)
			default:
				return this.create(
					new S.Rectangle({
						from : this.randomPoint(),
						size : [R(20, 100), R(20, 100)]
					}), z
				)
		};
	},
	createRandomDraggable : function (type, z) {
		return this.createRandom(type, z)
			.listenMouse()
			.clickable()
			.draggable();
	},
	createDraggable : function (shape, z) {
		return this.create(shape, z)
			.listenMouse()
			.clickable()
			.draggable();
	},
	draggable : function () {
		(5).times(function () {
			this.createRandomDraggable();
		}.bind(this));
	},
	droppable : function () {
		this.createRandomDraggable('poly', 10);
		this.createRandomDraggable('rect', 30)
			.drop(
				this.createRandomDraggable('circle', 20)
			)
			.bind('dropped', function (to) {
				trace(to ?
					'dropped to circle' :
					'dropped not to circle'
				);
			});
	},
	linkable : function () {
		this.createRandomDraggable('circle')
			.link(
				this.createRandomDraggable('rect')
			)
			.link(
				this.createRandomDraggable('rect')
			);
	},
	moveable : function () {
		var circle = this.createRandom('circle')
			.moveTo(this.randomPoint(), $random(40, 250))
			.bind('stopMove', function () {
				circle.moveTo(this.randomPoint(), $random(40, 250));
			}.bind(this))
	},
	de : function () {
		var elements = {};
		elements.window = this
			.create(new S.Rectangle([
				250, 150, 400, 200
			]), 40);
		elements.close = this
			.create(new S.Rectangle([
				615, 115, 20, 20
			]), 60)
			.listenMouse()
			.clickable()
			.bind('click', function () {
				change('rm');
			});
		elements.header = this
			.createDraggable(new S.Rectangle([
				250, 100, 400, 50
			]), 50)
			.link(elements.close)
			.link(elements.window);

		this.create(new S.Circle(50, 50, 25), 10)
			.listenMouse()
			.clickable()
			.bind('click', function () {
				change('add');
			});


		var change = function (act) {
			var method = act + "Element";
			for (var i in elements) {
				this.canvas[method](elements[i]);
			}
		}.bind(this);
	}
};

})();