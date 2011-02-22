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
	Extends: Beh.Drawable,
	Implements: [
		Beh.Animatable,
		Beh.Clickable,
		Beh.Draggable,
		Beh.Droppable,
		Beh.Linkable,
		Beh.MouseListener,
		Beh.Moveable
	],

	config : {},
	initialize : function (libcanvas, config) {
		this.libcanvas = libcanvas;
		this.setConfig(config);
		this.setShape(config.shape);
		
		this.getShape().addEvent('move', libcanvas.update);
		this.addEvent(['moveDrag', 'statusChanged'], libcanvas.update);
	},
	setConfig : function (config) {
		atom.extend(this.config, config);
		this.libcanvas.update();
		return this;
	},
	getStyle : function (type) {
		var cfg = this.config;
		return (this.active && cfg.active) ? cfg.active[type] :
		       (this.hover  && cfg.hover)  ? cfg.hover [type] :
		                      (cfg[type]  || null);
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