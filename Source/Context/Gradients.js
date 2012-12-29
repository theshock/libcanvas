/*
---

name: "Context.Gradients"

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
	- Shapes.Rectangle
	- Shapes.Circle

provides: Context.Gradients

...
*/

new function () {

var toPoint = Point.from, toRectangle = Rectangle.from, toCircle = Circle.from;


var addColorStopSource = document
	.createElement('canvas')
	.getContext('2d')
	.createLinearGradient(0,0,1,1)
	.addColorStop;

var addColorStop = function (colors) {
	if (typeof colors == 'object') {
		for (var position in colors) if (colors.hasOwnProperty(position)) {
			addColorStopSource.call( this, parseFloat(position), colors[position] );
		}
	} else {
		addColorStopSource.apply( this, arguments );
	}
	return this;
};


var fixGradient = function (grad) {
	grad.addColorStop = addColorStop;
	return grad;
};

/** @class LibCanvas.Context.Gradients */
LibCanvas.declare( 'LibCanvas.Context.Gradients', {
	initialize: function (context) {
		this.context = context;
		this.ctx2d   = context.ctx2d;
	},

	/** @returns {CanvasGradient} */
	createGradient: function (from, to, colors) {
		var gradient;
		if ( from instanceof Rectangle ) {
			colors   = to;
			gradient = this.createLinearGradient([ from ]);
		} else if (from instanceof Circle) {
			gradient = this.createRadialGradient([ from, to ]);
		} else if (from instanceof Point) {
			gradient = this.createLinearGradient([ from, to ]);
		} else {
			throw new Error('Unknown arguments in Context.Gradients.createGradient');
		}
		if (typeof colors == 'object') gradient.addColorStop( colors );
		return gradient;
	},
	/** @returns {CanvasGradient} */
	createRectangleGradient: function (rectangle, colors) {
		rectangle = toRectangle( rectangle );

		var from = rectangle.from, line = new Line( rectangle.bottomLeft, rectangle.topRight );

		return this.createGradient( from, line.perpendicular(from).scale(2, from), colors );
	},
	/** @returns {CanvasGradient} */
	createLinearGradient : function (a) {
		var from, to;
		if (a.length != 4) {
			if (a.length == 2) {
				to   = toPoint(a[0]);
				from = toPoint(a[1]);
			} else if (a.length == 1) {
				to   = toPoint(a[0].to);
				from = toPoint(a[0].from);
			} else {
				throw new TypeError('Wrong arguments.length in the Context.createLinearGradient');
			}
			a = [from.x, from.y, to.x, to.y];
		}
		return fixGradient( this.ctx2d.createLinearGradient.apply(this.ctx2d, a) );
	},
	/** @returns {CanvasGradient} */
	createRadialGradient: function (a) {
		var points, c1, c2, length = a.length;
		if (length == 1 || length == 2) {
			if (length == 2) {
				c1 = toCircle( a[0] );
				c2 = toCircle( a[1] );
			} else {
				c1 = toCircle( a.start );
				c2 = toCircle( a.end   );
			}
			points = [c1.center.x, c1.center.y, c1.radius, c2.center.x, c2.center.y, c2.radius];
		} else if (length == 6) {
			points = a;
		} else {
			throw new TypeError('Wrong arguments.length in the Context.createRadialGradient');
		}

		return fixGradient( this.ctx2d.createRadialGradient.apply(this.ctx2d, points) );
	}
});

};
