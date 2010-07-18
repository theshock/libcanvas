window.App = window.App || {};


(function () {

var R = window.$random;
var S = LibCanvas.Shapes;

var update = function (bind) {
	return function () {
		this.canvas.update();
	}.bind(bind);
};

App.Start = {
	create : function (shape, z) {
		var elem = new App.TestElem()
			.setShape(shape)
			.setZIndex(z || 1)
			.bind('statusChanged', update(this))
		this.canvas.addElement(elem);
		shape.bind('moved', update(this));
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
			}.bind(this));
	},
	de : function () {
		var change = function (act) {
			return function () {
				var method = act + "Element";
				for (var i in elements) {
					this.canvas[method](elements[i]);
				}
				update(this)();
			}.bind(this);
		}.bind(this);

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
			.bind('click', change('rm'));
		elements.header = this
			.createDraggable(new S.Rectangle([
				250, 100, 400, 50
			]), 50)
			.link(elements.close)
			.link(elements.window);

		this.create(new S.Circle(35, 35, 25), 10)
			.listenMouse()
			.clickable()
			.bind('click', change('add'));
	},
	cachedImage : function () {
		this.canvas.addElement(
			new App.ImageDrawer()
		);
	},
	pathDrawer : function () {
		this.canvas.addElement(
			new App.TestShape()
		);
	},
	pathBuilder : function () {
		new PathBuilder(this.canvas);
	},
	rotation : function () {
		var circle = function (x, y, r) {
			return this.create(
				new S.Circle({
					center : new LibCanvas.Point(x, y),
					radius : r
				})
			).getShape();
		}.bind(this);

		var O  = circle(400, 300, 10).center;
		var A  = circle(350, 300, 2).center;
		var B  = circle(300, 350, 3).center;
		var Aa = circle(365, 300, 1).center;
		var D  = circle(200, 300, 6).center;
		var Da = circle(210, 300, 1).center;
		var Db = circle(200, 320, 2).center;
		A.bind('moved', function (distance) {
			Aa.move(distance);
		});
		D.bind('moved', function (distance) {
			Da.move(distance);
			Db.move(distance);
		});

		(function () {
			 A.rotate(O, (1).degree());
			 B.rotate(O, (0.7).degree());
			Aa.rotate(A, (3).degree());
			 D.rotate(O, (0.3).degree());
			Da.rotate(D, (3).degree());
			Db.rotate(D, (2).degree());
			this.canvas.update();
		}.bind(this)).periodical(25);
	},
	polygonRotation : function () {
		var pivot = new LibCanvas.Point(300, 300);
		var poly  = new S.Polygon([200, 200], [400, 200], [400, 400], [300, 500], [200, 500], [300, 300]);
		this.create(poly);
		var circle = new S.Circle(500, 300, 10);
		this.createDraggable(circle);
		circle.bind('moved', function (distance) {
			if (circle.center.y < 100) {
				circle.center.y = 100;
			} else if (circle.center.y > 500) {
				circle.center.y = 500;
			} else {
				circle.center.x = 500;
				poly.rotate(pivot, (distance.y).degree());
				this.canvas.update();
			}
		}.bind(this));
	},
	polygonIntersect : function () {
		var poly1 = new S.Polygon([200, 200], [400, 200], [400, 400], [300, 500], [200, 500], [300, 300]);
		var poly2 = new S.Polygon([550, 200], [750, 200], [750, 400], [650, 500], [550, 500], [450, 300]);
		var elem1 = this.createDraggable(poly1);
		var elem2 = this.createDraggable(poly2);
		var check = function () {
			if (poly1.intersect(poly2)) {
				elem1.lineWidth = 2;
				elem2.lineWidth = 2;
			} else {
				elem1.lineWidth = 1;
				elem2.lineWidth = 1;
			}
		}
		check();
		poly1.bind('moved', check);
		poly2.bind('moved', check);
	}
};

})();