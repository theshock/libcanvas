LibCanvas.Shapes.Path = new Class({
	Extends : LibCanvas.Shape,
	set : function (builder) {
		this.builder = builder;
		return this;
	},
	getBuffer : function () {
		if (!this.buffer) {
			this.buffer = new Element('canvas', {
				width : 1, height : 1
			})
			this.buffer.ctx = this.buffer.getContext('2d-libcanvas');
		}
		return this.buffer;
	},
	path : function (ctx, wrap) {
		if (wrap) {
			ctx.beginPath();
		}
		this.builder.parts.each(function (part) {
			ctx[part.method].apply(ctx, part.args);
		});
		if (wrap) {
			ctx.closePath();
		}
		return ctx;
	},
	hasPoint : function (point) {
		var ctx = this.getBuffer().ctx;
		return this.path(ctx, true).isPointInPath(
			this.checkPoint(arguments)
		);
	},
	draw : function (ctx, type) {
		this.path(ctx, true)[type]();
		return this;
	},
	move : function (distance) {
		var moved = [];
		var move = function (a) {
			if (!moved.contains(a)) {
				a.move(distance);
				moved.push(a);
			}
		};
		this.builder.parts.each(function (part) {
			var a = part.args[0];
			switch(part.method) {
				case 'moveTo':
				case 'lineTo':
					move(a);
					break;
				case 'bezierCurveTo':
					['p1', 'p2', 'to'].each(function (prop) {
						move(a[prop]);
					});
					break;
				case 'arc':
					move(a.circle);
					break;
			}
		});
		return this;
	}
});

LibCanvas.Shapes.Path.Builder = new Class({
	Extends : LibCanvas.Shape,
	parts : [],
	add : function (method, args) {
		this.parts.push({
			method : method,
			args : args
		});
		return this;
	},
	move : function (point) {
		return this.add('moveTo', [
			this.checkPoint(arguments)
		]);
	},
	line : function () {
		return this.add('lineTo', [
			this.checkPoint(arguments)
		]);
	},
	curve : function (p1, p2, to) {
		var args = arguments.length > 1 ?
			arguments : arguments[0];
		if ($chk(args[0])) {
			args = {
				p1 : args[0],
				p2 : args[1],
				to : args[2]
			};
		}
		for (var i in args) {
			args[i] = this.checkPoint(args[i]);
		}
		return this.add('bezierCurveTo', [args]);
	},
	arc : function (circle, angle, acw) {
		var a = (arguments.length > 1) ?
			$A(arguments) : $A(arguments[0]);
		circle = a[0].circle instanceof LibCanvas.Shapes.Circle ? a[0].circle :
			new LibCanvas.Shapes.Circle(a[0].circle);
		var ang = a[0].angle;
		if ($type(a[0].angle) == 'array') {
			angle = {
				start : ang[0],
				end   : ang[1]
			}
		} else {
			angle = {
				start : [ ang.start, ang.s ].firstReal(),
				end   : [ ang.end  , ang.e ].firstReal()
			}
			if ($chk(ang.size) && !$chk(angle.end)) {
				angle.end = ang.size + angle.start;
			}
			if ($chk(ang.size) && !$chk(angle.start)) {
				angle.start = angle.end - ang.size;
			}
		}
		acw = !!a[0].anticlockwise || !!a[0].acw;
		return this.add('arc', [{
			circle : circle,
			angle : angle,
			acw : acw
		}]);
	},
	build : function () {
		return new LibCanvas.Shapes.Path(this);
	}
});