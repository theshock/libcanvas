
LibCanvas.Shape = new Class({
	initialize : function () {
		if (arguments.length > 0) {
			this.set.apply(this, arguments);
		}
	},
	checkDot : function (args) {
		if (args.length == 2) {
			return new LibCanvas.Dot(args);
		} else if (args[0] instanceof LibCanvas.Dot) {
			return args[0]
		} else {
			throw 'Not a LibCanvas.Dot in Circle.hasDot';
		}
	},
	move : function (a) {
		throw 'Abstract Method Shape.move called';
	},
	set : function (a) {
		throw 'Abstract Method Shape.set called';
	},
	hasDot : function (a) {
		throw 'Abstract Method Shape.hasDot called';
	},
	draw : function (a) {
		throw 'Abstract Method Shape.draw called';
	}
});