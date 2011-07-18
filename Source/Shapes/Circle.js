/*
---

name: "Shapes.Circle"

description: "Provides circle as canvas object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Circle

...
*/

new function () {

var Point = LibCanvas.Point;
	
LibCanvas.Shapes.Circle = atom.Class({
	Extends: LibCanvas.Shape,
	set : function () {
		var a = Array.pickFrom(arguments);

		if (a.length >= 3) {
			this.center = new Point(a[0], a[1]);
			this.radius = a[2];
		} else if (a.length == 2) {
			this.center = Point(a[0]);
			this.radius = a[1];
		} else {
			a = a[0];
			this.radius = [a.r, a.radius].pick();
			if ('x' in a && 'y' in a) {
				this.center = new Point(a.x, a.y);
			} else if ('center' in a) {
				this.center = Point(a.center);
			} else if ('from' in a) {
				this.center = new Point(a.from).move({
					x: this.radius,
					y: this.radius
				});
			}
		}
		if (this.center == null) throw new TypeError('center is null');
		if (this.radius == null) throw new TypeError('radius is null');
	},
	get center () {
		return this._center;
	},
	set center (center) {
		this._center = center;
	},
	getCoords : function () {
		return this.center;
	},
	hasPoint : function (point) {
		return this.center.distanceTo(point) <= this.radius;
	},
	scale : function (factor) {
		this.center.scale(factor);
		return this;
	},
	getCenter: function () {
		return this.center;
	},
	intersect : function (obj) {
		if (obj instanceof this.self) {
			return this.center.distanceTo(obj.center) < this.radius + obj.radius;
		}
		return false;
	},
	move : function (distance, reverse) {
		distance = this.invertDirection(distance, reverse);
		this.center.move(distance);
		this.fireEvent('move', [distance]);
		return this;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		if (this.radius) {
			ctx.arc({
				circle : this,
				angle  : [0, (360).degree()]
			});
		}
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	clone : function () {
		return new this.self(this.center.clone(), this.radius);
	},
	getPoints : function () {
		return { center : this.center };
	},
	dump: function () {
		return '[shape Circle(center['+this.center.x+', '+this.center.y+'], '+this.radius+')]';
	},
	toString: Function.lambda('[object LibCanvas.Shapes.Circle]')
});

}();