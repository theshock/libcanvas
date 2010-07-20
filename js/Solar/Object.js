Solar.Object = new Class({
	Extends : LC.Interfaces.Drawable,

	system : null,
	radius : 0,
	color  : '',
	stroke : {},
	position : null, /* Point */
	trajectory : null,

	paramsList : ['radius', 'color', 'stroke'],
	initialize : function (solarSystem, params) {
		this.system = solarSystem;
		this.params(params);
	},
	params : function (values) {
		if ($type(values) == 'array') {
			values = values.associate(this.paramsList);
		}
		
		this.paramsList.each(function (name) {
			if ($chk(values[name])) {
				this[name] = values[name];
			}
		}.bind(this));
		return this;
	},
	setPosition : function (position) {
		this.setShape(new Shapes.Circle({
			radius : this.radius,
			center : position
		}));
		this.position = position;
		return this;
	},
	draw : function () {
		var ctx = this.canvas.ctx;

		ctx.fill(this.shape, this.color);

		if (this.stroke && this.stroke.width) {
			ctx.save()
				.set('lineWidth', this.stroke.width)
				.stroke(this.shape, this.stroke.color)
				.restore();
		}

	}

});