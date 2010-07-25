Apps.Droppable = new Class({
	Extends : Interface.Interface,
	run : function () {
		this.shape('poly', 10);
		this.shape('rect', 30)
			.drop(this.shape('circle', 20))
			.bind('dropped', this.getTraceFn());
	},
	shape : function (type, z) {
		return this.helper.createRandomDraggable(type, z);
	},
	countYes : 1,
	countNo  : 1,
	getTraceFn : function () {
		return function (to) {
			var shape = to ?
				new LibCanvas.Shapes.Circle(
					4+10*this.countYes++,  4+10, 4
				) :
				new LibCanvas.Shapes.Rectangle(
					  10*this.countNo++ , 10+10, 8, 8
				);
			this.helper.create(shape);
		}.bind(this);
	}
});