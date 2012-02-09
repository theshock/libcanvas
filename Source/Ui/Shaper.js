/*
---

name: "Ui.Shaper"

description: "Provides base ui object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Drawable
	- Behaviors.Animatable
	- Behaviors.Clickable
	- Behaviors.Draggable
	- Behaviors.Droppable
	- Behaviors.Linkable
	- Behaviors.MouseListener
	- Behaviors.Moveable

provides: Ui.Shaper

...
*/

var Shaper = LibCanvas.Ui.Shaper = Class({
	Extends: Class.Options,
	Implements: [
		Drawable, Animatable, Clickable, MouseListener,
		Linkable, Draggable , Droppable, Moveable
	],

	active: false,
	hover : false,

	initialize : function (libcanvas, options) {
		this.update = libcanvas.update;

		this.setOptions(options);
		this.setShape(options.shape);

		this.getShape().addEvent('move', libcanvas.update);
		this.addEvent(['moveDrag', 'statusChanged'], libcanvas.update);
	},
	setOptions : function (options) {
		this.update();
		return this.parent(options);
	},
	getStyle : function (type) {
		var o = this.options;
		return (this.active && o.active) ? o.active[type] :
		       (this.hover  && o.hover)  ? o.hover [type] :
		                      (o[type]  || null);
	},

	drawTo : function (ctx) {
		var fill    = this.getStyle('fill'),
			stroke  = this.getStyle('stroke'),
			shadow  = this.getStyle('shadow'),
			lineW   = this.getStyle('lineWidth'),
			opacity = this.getStyle('opacity');

		ctx.save();
		if (lineW  ) ctx.set('lineWidth', lineW);
		if (opacity) ctx.set('globalOpacity', opacity);
		if (shadow ) ctx.set('shadow', shadow);
		if (fill   ) ctx.fill  (this.getShape(), fill  );
		if (stroke ) ctx.stroke(this.getShape(), stroke);
		ctx.restore();
		return this;
	},
	draw : function () {
		return this.drawTo(this.libcanvas.ctx);
	},

	// accessors


	get fill () {
		return this.options.fill;
	},
	set fill (value) {
		this.options.fill = value;
		this.update();
	},

	get stroke () {
		return this.options.stroke;
	},
	set stroke (value) {
		this.options.stroke = value;
		this.update();
	},

	get lineWidth () {
		return this.options.lineWidth;
	},
	set lineWidth (value) {
		this.options.lineWidth = value;
		this.update();
	},

	get radius () {
		if (!Circle.isInstance(this.shape)) {
			throw new TypeError('Shape is not circle');
		}
		return this.shape.radius;
	},
	set radius (value) {
		if (!Circle.isInstance(this.shape)) {
			throw new TypeError('Shape is not circle');
		}
		this.shape.radius = value;
		this.update();
	},
	dump: function () {
		return '[Shaper ' + this.shape.dump() + ']';
	},
	toString: Function.lambda('[object LibCanvas.Ui.Shaper]')
});