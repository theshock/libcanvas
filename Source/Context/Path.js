/*
---

name: "Context.Path"

description: "LibCanvas.Context2D adds new canvas context '2d-libcanvas'"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Size
	- Shapes.Circle

provides: Context.Path

...
*/

new function () {

var toPoint = Point.from, toCircle = Circle.from;


/** @class LibCanvas.Context.Path */
LibCanvas.declare( 'LibCanvas.Context.Path', {
	initialize: function (context) {
		this.context = context;
		this.ctx2d   = context.ctx2d;
	},


	/** @returns {Context2D} */
	arc : function (a) {

		if (a.length > 1) {
			return this.ctx2d.arc.apply(this.ctx2d, a);
		} else if (!a[0].circle) {
			throw new TypeError('Wrong arguments in CanvasContext.arc');
		}

		var f = a[0], circle, angle, angleStart, angleEnd, angleSize;
		circle = toCircle(f.circle);
		angle = f.angle;

		if (Array.isArray(angle)) {
			angleStart = angle[0];
			angleEnd   = angle[1];
		} else {
			angleStart = angle.start;
			angleEnd   = angle.end;
			angleSize  = angle.size;

			if (angleSize == null) {
				// do nothing
			} else if (angleEnd == null) {
				angleEnd = angleSize + angleStart;
			} else if (angleStart == null) {
				angleStart = angleEnd - angleSize;
			}
		}
		this.ctx2d.arc(
			circle.center.x, circle.center.y, circle.radius,
			angleStart, angleEnd, !!(f.anticlockwise || f.acw)
		);
		return this.context;
	},

	/** @returns {Context2D} */
	arcTo : function () {
		// @todo Beauty arguments
		this.ctx2d.arcTo.apply(this.ctx2d, arguments);
		return this.context;
	},
	/** @returns {Context2D} */
	curveTo: function (a) {
		var p, l, to, curve = a[0];

		if (typeof curve == 'number') {
			if (a.length === 4) {
				return this.quadraticCurveTo(a);
			} else if (a.length === 6) {
				return this.bezierCurveTo(a);
			}
		} else if (a.length > 1) {
			p  = atom.array.from( a ).map(toPoint);
			to = p.shift()
		} else {
			p  = atom.array.from( curve.points ).map(toPoint);
			to = toPoint(curve.to);
		}

		l = p.length;

		if (l == 2) {
			this.ctx2d.bezierCurveTo(
				p[0].x, p[0].y, p[1].x, p[1].y, to.x, to.y
			);
		} else if (l == 1) {
			this.ctx2d.quadraticCurveTo(
				p[0].x, p[0].y, to.x, to.y
			);
		} else {
			this.ctx2d.lineTo(to.x, to.y);
		}
		return this.context;
	},
	/** @returns {Context2D} */
	quadraticCurveTo : function (a) {
		if (a.length == 4) {
			this.ctx2d.quadraticCurveTo.apply(this.ctx2d, a);
			return this.context;
		} else {
			a = a.length == 2 ? {p:a[0], to:a[1]} : a[0];
			return this.curveTo([{
				to: a.to,
				points: [a.p]
			}]);
		}
	},
	/** @returns {Context2D} */
	bezierCurveTo : function (a) {
		if (a.length == 6) {
			this.ctx2d.bezierCurveTo.apply(this.ctx2d, a);
			return this.context;
		} else {
			a = a.length == 3 ? {p1:a[0], p2:a[1], to:a[2]} : a[0];
			return this.curveTo([{
				to: a.to,
				points: [a.p1, a.p2]
			}]);
		}
	},
	isPointInPath: function (x, y) {
		if (y == null) {
			x = toPoint(x);
			y = x.y;
			x = x.x;
		}
		return this.ctx2d.isPointInPath(x, y);
	}

});

};
