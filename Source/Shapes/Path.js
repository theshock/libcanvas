/*
---

name: "Shapes.Path"

description: "Provides Path as canvas object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Path

...
*/
var Path = LibCanvas.Shapes.Path = Class(
/** @lends {LibCanvas.Shapes.Path.prototype} */
{
	Extends: Shape,

	getCoords: null,
	set : function (builder) {
		this.builder = builder;
		builder.path = this;
		return this;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		this.each(function (method, args) {
			ctx[method].apply(ctx, args);
		});
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	intersect: function (obj) {
		return this.getBoundingRectangle( obj );
	},
	each: function (fn) {
		this.builder.parts.forEach(function (part) {
			fn.call( this, part.method, part.args );
		}.bind(this));
		return this;
	},
	get allPoints () {
		var points = [];
		this.each(function (method, args) {
			if (method == 'arc') {
				points.include(args[0].circle.center);
			} else for (var i = 0, l = args.length; i < l; i++) {
				points.include(args[i]);
			}
		});
		return points;
	},
	get center () {
		return new Point().mean(this.allPoints);
	},
	hasPoint : function (point) {
		var ctx = shapeTestBuffer().ctx;
		if (this.builder.changed) {
			this.builder.changed = false;
			this.processPath(ctx);
		}
		return ctx.isPointInPath(Point(arguments));
	},
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	},
	move : function (distance, reverse) {
		this.builder.changed = true;

		this.allPoints.invoke( 'move', distance, reverse );
		return this;
	},
	scale: function (power, pivot) {
		this.builder.changed = true;

		this.allPoints.invoke( 'scale', power, pivot );
		return this;
	},
	grow: function () {
		return this;
	},
	rotate: function (angle, pivot) {
		this.builder.changed = true;

		this.allPoints.invoke( 'rotate', angle, pivot );

		this.each(function (method, args) {
			if (method == 'arc') {
				var a = args[0].angle;
				a.start = (a.start + angle).normalizeAngle();
				a.end   = (a.end   + angle).normalizeAngle();
			}
		}.bind(this));
		return this;
	},
	// #todo: fix arc, cache
	getBoundingRectangle: function () {
		var p = this.allPoints, from, to;
		if (p.length == 0) throw new Error('Is empty');

		from = p[0].clone(), to = p[0].clone();
		for (var l = p.length; l--;) {
			from.x = Math.min( from.x, p[l].x );
			from.y = Math.min( from.y, p[l].y );
			  to.x = Math.max(   to.x, p[l].x );
			  to.y = Math.max(   to.y, p[l].y );
		}
		return new Rectangle( from, to );
	},
	clone: function () {
		var builder = new Path.Builder;
		builder.parts.append( this.builder.parts.clone() );
		return builder.build();
	},
	toString: Function.lambda('[object LibCanvas.Shapes.Path]')
});

Path.Builder = LibCanvas.Shapes.Path.Builder = Class({
	initialize: function (str) {
		this.update = this.update.bind( this );
		this.parts  = [];
		if (str) this.parse( str );
	},
	update: function () {
		this.changed = true;
		return this;
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
	listenPoint: function (p) {
		return Point( p )
			.removeEvent( 'move', this.update )
			.   addEvent( 'move', this.update );
	},

	// queue/stack
	changed : true,
	push : function (method, args) {
		this.parts.push({ method : method, args : args });
		return this.update();
	},
	unshift: function (method, args) {
		this.parts.unshift({ method : method, args : args });
		return this.update();
	},
	pop : function () {
		this.parts.pop();
		return this.update();
	},
	shift: function () {
		this.parts.shift();
		return this.update();
	},

	// methods
	move : function () {
		return this.push('moveTo', [ this.listenPoint(arguments) ]);
	},
	line : function () {
		return this.push('lineTo', [ this.listenPoint(arguments) ]);
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

		return this.push('curveTo', args.map( this.listenPoint.bind( this ) ));
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
		} else if (circle instanceof Circle) {
			a = { circle: circle, angle: [0, (360).degree()] };
		} else {
			a = a[0];
		}

		a.circle = Circle(a.circle);

		if (Array.isArray(a.angle)) {
			a.angle = {
				start : a.angle[0],
				end   : a.angle[1]
			};
		}

		this.listenPoint( a.circle.center );

		a.acw = !!(a.acw || a.anticlockwise);
		return this.push('arc', [a]);
	},
	
	// stringing
	stringify : function (sep) {
		if (!sep) sep = ' ';
		var p = function (p) { return sep + p.x.round(2) + sep + p.y.round(2); };
		return this.parts.map(function (part) {
			var a = part.args[0];
			switch(part.method) {
				case 'moveTo' : return 'M' + p(a);
				case 'lineTo' : return 'L' + p(a);
				case 'curveTo': return 'C' + part.args.map(p).join('');
				case 'arc'    : return 'A' +
					p( a.circle.center ) + sep + a.circle.radius.round(2) + sep +
					a.angle.start.round(2) + sep + a.angle.end.round(2) + sep + (a.acw ? 1 : 0);
			}
		}).join(sep);
	},

	parse : function (string) {
		var parts = string.split(/[ ,|]/), full  = [];

		parts.forEach(function (part) {
			if (!part.length) return;
			
			if (isNaN(part)) {
				full.push({ method : part, args : [] });
			} else if (full.length) {
				full.last.args.push( Number(part) );
			}
		});

		full.forEach(function (p) {
			var method = { M : 'move', L: 'line', C: 'curve', A: 'arc' }[p.method];
			return this[method].apply(this, p.args);
		}.bind(this));

		return this;
	},

	toString: Function.lambda('[object LibCanvas.Shapes.Path]')
});