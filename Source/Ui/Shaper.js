/*
---

name: "Ui.Shaper"

description: "Provides base ui object"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Drawable
	- Behaviors.Clickable
	- Behaviors.Draggable
	- Behaviors.Droppable
	- Behaviors.Linkable
	- Behaviors.MouseListener
	- Behaviors.Moveable

provides: Ui.Shaper

...
*/


new function () {

var Beh = LibCanvas.Behaviors;

LibCanvas.namespace('Ui').Shaper = atom.Class({
	Extends: atom.Class.Options,
	Implements: [
		Beh.Drawable,
		Beh.Animatable,
		Beh.Clickable,
		Beh.Draggable,
		Beh.Droppable,
		Beh.Linkable,
		Beh.MouseListener,
		Beh.Moveable
	],

	options : {},
	initialize : function (libcanvas, options) {
		this.libcanvas = libcanvas;
		this.setOptions(options);
		this.setShape(options.shape);
		
		this.getShape().addEvent('move', libcanvas.update);
		this.addEvent(['moveDrag', 'statusChanged'], libcanvas.update);
	},
	setOptions : function (options) {
		this.libcanvas.update();
		return this.parent(options);
	},
	getStyle : function (type) {
		var o = this.options;
		return (this.active && o.active) ? o.active[type] :
		       (this.hover  && o.hover)  ? o.hover [type] :
		                      (o[type]  || null);
	},
	drawTo : function (ctx) {
		var fill   = this.getStyle('fill'),
			stroke = this.getStyle('stroke');
		fill   && ctx.fill  (this.getShape(), fill  );
		stroke && ctx.stroke(this.getShape(), stroke);
		return this;
	},
	draw : function () {
		return this.drawTo(this.libcanvas.ctx);
	}
});

};