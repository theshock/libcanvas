/*
---

name: "Shapes.Rectangle"

description: "Provides rectangle as canvas object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shape

provides: Shapes.Rectangle

...
*/

new function () {

var Point  = LibCanvas.Point,
	math   = Math,
	random = Number.random,

Rectangle = LibCanvas.Shapes.Rectangle = atom.Class({
	Extends: LibCanvas.Shape,
	set : function () {
		var a = Array.pickFrom(arguments);

		if (a.length == 4) {
			this.from = new Point(a[0], a[1]);
			this.to   = this.from.clone().move({x:a[2], y:a[3]});
		} else if (a.length == 2) {
			if ('width' in a[1] && 'height' in a[1]) {
				this.set({ from: a[0], size: a[1] });
			} else {
				this.from = Point.from(a[0]);
				this.to   = Point.from(a[1]);
			}
		} else {
			a = a[0];
			if (a.from) {
				this.from = Point.from(a.from);
			} else if ('x' in a && 'y' in a) {
				this.from = new Point(a.x, a.y);
			}
			if (a.to) this.to = Point.from(a.to);
		
			if (!a.from || !a.to) {
				var as = a.size, size = {
					x : (as ? [as.w, as[0], as.width ] : [ a.w, a.width  ]).pick(),
					y : (as ? [as.h, as[1], as.height] : [ a.h, a.height ]).pick()
				};
				this.from ?
					(this.to = this.from.clone().move(size, 0)) :
					(this.from = this.to.clone().move(size, 1));
			}
		
		}
		return this;
	},

	get width() {
		return this.to.x - this.from.x;
	},
	get height() {
		return this.to.y - this.from.y;
	},
	set width (width) {
		this.to.moveTo({ x : this.from.x + width, y : this.to.y });
	},
	set height (height) {
		this.to.moveTo({ x : this.to.x, y : this.from.y + height });
		return this;
	},
	get size () {
		return {
			width : this.width,
			height: this.height
		};
	},
	set size (size) {
		this.width  = size.width;
		this.height = size.height;
	},
	// @deprecated 
	getWidth : function () {
		return this.width;
	},
	// @deprecated
	getHeight : function () {
		return this.height;
	},
	// @deprecated 
	setWidth : function (width) {
		this.width = width;
		return this;
	},
	// @deprecated
	setHeight : function (height) {
		this.height = height;
		return this;
	},
	hasPoint : function (point, padding) {
		point   = Point.from(arguments);
		padding = padding || 0;
		return point.x != null && point.y != null
			&& point.x.between(math.min(this.from.x, this.to.x) + padding, math.max(this.from.x, this.to.x) - padding, 1)
			&& point.y.between(math.min(this.from.y, this.to.y) + padding, math.max(this.from.y, this.to.y) - padding, 1);
	},
	moveTo: function (rect) {
		if (rect instanceof LibCanvas.Point) {
			var diff = this.from.diff(rect);
			this.from.move(diff);
			this.  to.move(diff);
		} else {
			rect = Rectangle.from(arguments);
			this.from.moveTo(rect.from);
			this.  to.moveTo(rect.to);
		}
		return this;
	},
	draw : function (ctx, type) {
		// fixed Opera bug - cant drawing rectangle with width or height below zero
		ctx.original(type + 'Rect', [
			math.min(this.from.x, this.to.x),
			math.min(this.from.y, this.to.y),
			this.width .abs(),
			this.height.abs()
		]);
		return this;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();
		ctx
			.moveTo(this.from.x, this.from.y)
			.lineTo(this.to.x, this.from.y)
			.lineTo(this.to.x, this.to.y)
			.lineTo(this.from.x, this.to.y)
			.lineTo(this.from.x, this.from.y);
		if (!noWrap) ctx.closePath();
		return ctx;
	},
	intersect : function (obj) {
		if (obj instanceof this.self) {
			return this.from.x < obj.to.x && this.to.x > obj.from.x
			    && this.from.y < obj.to.y && this.to.y > obj.from.y;
		}
		return false;
	},
	getRandomPoint : function (margin) {
		margin = margin || 0;
		return new Point(
			random(margin, this.width  - margin),
			random(margin, this.height - margin)
		);
	},
	translate : function (point, fromRect) {
		var diff = fromRect.from.diff(point);
		return new Point({
			x : (diff.x / fromRect.width ) * this.width,
			y : (diff.y / fromRect.height) * this.height
		});
	},
	snapToPixel: function () {
		this.from.snapToPixel();
		this.to.snapToPixel();
		return this;
	},
	dump: function () {
		return this.parent('Rectangle');
	},
	toString: Function.lambda('[object LibCanvas.Shapes.Rectangle]')
});

};