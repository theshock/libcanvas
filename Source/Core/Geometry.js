
LibCanvas.Geometry = atom.Class({
	Implements: [LibCanvas.Behaviors.Bindable],
	Static: {
		from : function (obj) {
			return obj[0] instanceof this ? obj[0] : obj instanceof this ? obj : new this(obj);
		}
	},
	initialize : function () {
		if (arguments.length) this.set.apply(this, arguments);
	},
	move : function (distance, reverse) {
		var sign = function (num) {
			return num * (reverse ? -1 : 1);
		};
		var moved = {
			x : sign(distance.x),
			y : sign(distance.y)
		};

		this.bind('move', [moved]);
		return this;
	}
});