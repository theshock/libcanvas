/*
---

name: "Shapes.Path"

description: "Provides Path as canvas object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Path

...
*/

(function (LibCanvas) {

var Point = LibCanvas.Point, Shapes = LibCanvas.Shapes;

var Path = LibCanvas.Shapes.Path = atom.Class({
	Extends: LibCanvas.Shape,

	Generators : {
		buffer: function () {
			return LibCanvas.Buffer(1, 1, true);
		}
	},

	getCoords: null,
	set : function (builder) {
		this.builder = builder;
		builder.path = this;
		return this;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		this.builder.parts.forEach(function (part) {
			ctx[part.method].apply(ctx, part.args);
		});
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	hasPoint : function (point) {
		var ctx = this.buffer.ctx;
		if (this.builder.changed) {
			this.builder.changed = false;
			this.processPath(ctx);
		}
		return ctx.isPointInPath(Point.from(arguments));
	},
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	},
	move : function (distance) {
		this.builder.changed = true;

		var moved = [], move = function (a) {
			if (!moved.contains(a)) {
				a.move(distance);
				moved.push(a);
			}
		};
		this.builder.parts.forEach(function (part) {
			var a = part.args;
			if (part.method == 'arc') {
				move(a[0].circle);
			} else {
				a.map(move);
			}
		});
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Shapes.Path]')
});

LibCanvas.Shapes.Path.Builder = atom.Class({
	initialize: function (str) {
		this.parts = [];
		if (str) this.parse( str );
	},
	build : function (str) {
		if ( str != null ) this.parse(str);
		if ( !this.path  ) this.path = new Path(this);

		return this.path;
	},
	snapToPixel: function () {
		this.parts.forEach(function (part) {
			var a = part.args;
			if (part.method == 'arc') {
				a[0].circle.center.snapToPixel();
			} else {
				a.invoke('snapToPixel');
			}
		});
		return this;
	},

	// queue/stack
	changed : true,
	push : function (method, args) {
		this.changed = true;
		this.parts.push({ method : method, args : args });
		return this;
	},
	unshift: function (method, args) {
		this.changed = true;
		this.parts.unshift({ method : method, args : args });
		return this;
	},
	pop : function () {
		this.changed = true;
		this.parts.pop();
		return this;
	},
	shift: function () {
		this.changed = true;
		this.parts.shift();
		return this;
	},

	// methods
	move : function () {
		return this.push('moveTo', [Point.from(arguments)]);
	},
	line : function () {
		return this.push('lineTo', [Point.from(arguments)]);
	},
	curve : function (to, p1, p2) {
		var args = Array.pickFrom(arguments);

		if (args.length == 6) {
			args = [
				[ args[0], args[1] ],
				[ args[2], args[3] ],
				[ args[4], args[5] ]
			];
		} else if (args.length == 4){
			args = [
				[ args[0], args[1] ],
				[ args[2], args[3] ]
			];
		}

		return this.push('curveTo', args.map( Point.from.bind(Point) ));
	},
	arc : function (circle, angle, acw) {
		var a = Array.pickFrom(arguments);

		if (a.length >= 6) {
			a = {
				circle : [ a[0], a[1], a[2] ],
				angle : [ a[3], a[4] ],
				acw : a[5]
			};
		} else if (a.length > 1) {
			a.circle = circle;
			a.angle  = angle;
			a.acw    = acw;
		} else if (circle instanceof Shapes.Circle) {
			a = { circle: circle, angle: [0, (360).degree()] };
		} else {
			a = a[0];
		}

		a.circle = Shapes.Circle.from(a.circle);

		if (Array.isArray(a.angle)) {
			a.angle = {
				start : a.angle[0],
				end   : a.angle[1]
			};
		}
		a.acw = !!(a.acw || a.anticlockwise);
		return this.push('arc', [a]);
	},
	
	// stringing
	stringify : function () {
		var p = function (p) { return ' ' + p.x.round(2) + ' ' + p.y.round(2); };
		return this.parts.map(function (part) {
			var a = part.args[0];
			switch(part.method) {
				case 'moveTo' : return 'M' + p(a);
				case 'lineTo' : return 'L' + p(a);
				case 'curveTo': return 'C' + part.args.map(p);
				case 'arc': return 'A'
					+ p( a.circle.center ) + ' ' + a.circle.radius.round(2) + ' '
					+ a.angle.start.round(2) + ' ' + a.angle.end.round(2) + ' ' + (a.acw ? 1 : 0);
			}
		}).join(' ');
	},

	parse : function (string) {
		var parts = string.split(' '), full  = [];

		parts.forEach(function (part) {
			if (!part.length) return;
			
			if (isNaN(part)) {
				full.push({ method : part, args : [] });
			} else if (full.length) {
				full.last.args.push( Number(part) );
			}
		});

		full.forEach(function (p) {
			var method = {
				M : 'moveTo', L: 'lineTo', C: 'curveTo', A: 'arc'
			}[p.method];

			return this[method].apply(this, p.args);
		}.bind(this));

		return this;
	},

	toString: Function.lambda('[object LibCanvas.Shapes.Path]')
});

})(LibCanvas);