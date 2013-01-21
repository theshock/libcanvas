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
	- Shapes.Polygon

provides: Shapes.Path

...
*/

/**
 * @class Path
 * @extends Polygon:
 * get center
 * draw()
 * move(distance, reverse)
 * scale(power, pivot)
 * rotate(angle, pivot)
 * getBoundingRectangle()
 * [empty] grow()
 */
var Path = LibCanvas.declare( 'LibCanvas.Shapes.Path', 'Path', Polygon, {
	parts: [],

	initialize : function (parts) {
		this.parts = [];

		if (parts) this.set(parts);
	},

	set : function (parts) {
		this.parts.length = 0;

		if (Array.isArray(parts)) {
			for (var i = 0, l = parts.length; i < l; i++) {
				this.push(parts[i]);
			}
		}
	},

	get length () {
		return this.parts.length;
	},

	// methods
	moveTo: function (point) {
		return this.push('moveTo', [ Point.from(point) ]);
	},
	lineTo: function (point) {
		return this.push('lineTo', [ Point.from(point) ]);
	},
	curveTo: function (to, cp1, cp2) {
		var points = atom.array.pickFrom(arguments).map(Point);
		return this.push('curveTo', points);
	},

	// queue/stack
	push : function (method, points) {
		this.parts.push(Path.Part.from(method, points));
		return this;
	},
	unshift: function (method, points) {
		this.parts.unshift(Path.Part.from(method, points));
		return this;
	},
	pop : function () {
		return this.parts.pop();
	},
	shift: function () {
		return this.parts.shift();
	},

	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		this.forEach(function (part) {
			ctx[part.method].apply(ctx, part.points);
		});
		if (!noWrap) ctx.closePath();
		return ctx;
	},

	intersect: function (obj) {
		return this.getBoundingRectangle()
			.intersect(	obj.getBoundingRectangle() );
	},

	forEach: function (fn) {
		var parts = this.parts, i = 0, l = parts.length;
		while (i < l) {
			fn.call( this, parts[i++], i, this );
		}
		return this;
	},

	get points () {
		var points = [];
		this.forEach(function (part) {
			for (var i = 0, l = part.points.length; i < l; i++) {
				atom.array.include(points, part.points[i]);
			}
		});
		return points;
	},

	hasPoint : function (point) {
		var ctx = shapeTestBuffer().ctx;
		this.processPath(ctx);
		return ctx.isPointInPath(Point.from(point));
	},
	clone: function () {
		return new this.constructor(
			this.parts.invoke('clone')
		);
	}
});
/** @class Path.Part */
atom.declare('LibCanvas.Shapes.Path.Part', {
	initialize: function (method, points) {
		this.method = method;
		this.points = points.map(Point);
	},

	clone: function () {
		return new this.constructor(
			this.method,
			this.points.invoke('clone')
		);
	}
}).own({
	from: function (method, args) {
		if (method == null) {
			throw new Error('Empty path method');
		}

		if (typeof method == 'string') {
			return new this(method, args) ;
		} else if (atom.core.isArrayLike(method)) {
			return new this(method[0], args[1]);
		} else {
			return this;
		}
	}
});