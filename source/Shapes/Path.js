/*
---
description: Provides a user-defined path (similar to vector graphics) as canvas object

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Shape

provides: [LibCanvas.Shapes.Path]
*/

LibCanvas.Shapes.Path = new Class({
	Extends : LibCanvas.Shape,
	set : function (builder) {
		this.builder = builder;
		builder.path = this;
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
	processPath : function (ctx, noWrap) {
		if (!noWrap) {
			ctx.beginPath();
		}
		this.builder.parts.each(function (part) {
			ctx[part.method].apply(ctx, part.args);
		});
		if (!noWrap) {
			ctx.closePath();
		}
		return ctx;
	},
	hasPoint : function (point) {
		var ctx = this.getBuffer().ctx;
		if (this.builder.changed) {
			this.builder.changed = false;
			this.processPath(ctx);
		}
		return ctx.isPointInPath(
			this.checkPoint(arguments)
		);
	},
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
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
	changed : true,
	add : function (method, args) {
		this.changed = true;
		this.parts.push({
			method : method,
			args : args
		});
		return this;
	},
	pop : function () {
		this.changed = true;
		this.parts.pop();
		return this;
	},
	move : function () {
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
		if (args.length >= 6) {
			return this.curve(
				[ args[0], args[1] ],
				[ args[2], args[3] ],
				[ args[4], args[5] ]
			);
		}
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
			arguments : arguments[0];
		if (a.length >= 6) {
			return this.arc({
				circle : [ a[0], a[1], a[2] ],
				angle : [ a[3], a[4] ],
				acw : a[5]
			});
		}
		a.circle = a.circle instanceof LibCanvas.Shapes.Circle ? a.circle :
			new LibCanvas.Shapes.Circle(a.circle);
		if ($type(a.angle) == 'array') {
			a.angle = {
				start : a.angle[0],
				end   : a.angle[1]
			};
		}
		a.acw = !!a.acw;
		return this.add('arc', [a]);
	},
	hasPoint : function () {
		var path = this.build();
		return path.hasPoint.apply(path, arguments);
	},
	string : function () {
		var string = '';
		this.parts.each(function (part) {
			var a = part.args[0];
			switch(part.method) {
				case 'moveTo':
					string += 'move,' + a.x.round(2) + ',' + a.y.round(2);
					break;
				case 'lineTo':
					string += 'line,' + a.x.round(2) + ',' + a.y.round(2);
					break;
				case 'bezierCurveTo':
					string += 'curve,';
					['p1', 'p2', 'to'].each(function (prop) {
						string += a[prop].x.round(2) + ',' + a[prop].y.round(2);
						if (prop != 'to') {
							string += ',';
						}
					});
					break;
				case 'arc':
					string += 'arc,';
					string += a.circle.center.x.round(2) + ',' + a.circle.center.y.round(2) + ',';
					string += a.circle.radius.round(2) + ',' + a.angle.start.round(2) + ',';
					string += a.angle.end.round(2) + ',' + (a.acw ? 1 : 0);
					break;
			}
			string += '/';
		}.bind(this));
		return string;
	},
	parseString : function (string) {
		string.split('/').each(function (line) {
			if (line) {
				var parts  = line.split(',');
				var method = parts.shift();
				parts.each(function (value, i) {
					parts[i] *= 1;
				});
				this[method].apply(this, parts);
			}
		}.bind(this));
	},
	build : function () {
		if (arguments.length == 1) {
			this.parseString(arguments[0]);
		}
		if (!this.path) {
			this.path = new LibCanvas.Shapes.Path(this);
		}
		return this.path;
	}
});