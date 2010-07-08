
LibCanvas.Shape = new Class({
	initialize : function () {
		if (arguments.length > 0) {
			this.set.apply(this, arguments);
		}
	},
	checkPoint : function (args) {
		if (args.length == 2) {
			return new LibCanvas.Point(args);
		} else if (args[0] instanceof LibCanvas.Point) {
			return args[0]
		} else {
			throw 'Not a LibCanvas.Point in Circle.hasPoint';
		}
	},
	move : function (a) {
		throw 'Abstract Method Shape.move called';
	},
	set : function (a) {
		throw 'Abstract Method Shape.set called';
	},
	hasPoint : function (a) {
		throw 'Abstract Method Shape.hasPoint called';
	},
	draw : function (a) {
		throw 'Abstract Method Shape.draw called';
	}
});