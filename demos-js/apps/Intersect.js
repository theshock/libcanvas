(function () {

var Poly = LibCanvas.Shapes.Polygon;

Apps.Intersect = new Class({
	Extends  : Interface.Interface,
	run : function () {
		var poly1 = new Poly([100, 100], [300, 100], [300, 300], [200, 400], [100, 400], [200, 200]);
		var poly2 = new Poly([450, 100], [650, 100], [650, 300], [550, 400], [450, 400], [350, 200]);
		var elem1 = this.helper.createDraggable(poly1);
		var elem2 = this.helper.createDraggable(poly2);
		var check = function () {
			if (poly1.intersect(poly2)) {
				elem1.lineWidth = 3;
				elem2.lineWidth = 3;
			} else {
				elem1.lineWidth = 1;
				elem2.lineWidth = 1;
			}
		}
		check();
		poly1.bind('moved', check);
		poly2.bind('moved', check);
	}
});

})();