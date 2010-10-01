/*
---
description:

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Ui.Grio]
*/
(function () {

var Beh = LibCanvas.Behaviors;

LibCanvas.Ui.Grip = new Class({
	Extends : Beh.Drawable,
	Implements : [
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
		
		var update = libcanvas.update.bind(libcanvas);
		this.getShape().bind('move', update);
		this.bind(['moveDrag', 'statusChanged'], update);
	},
	setConfig : function (config) {
		this.config = $merge(this.config, config);
		this.libcanvas.update();
		return this;
	},
	getStyle : function (type) {
		return (this.active && this.config.active && this.config.active[type]) ||
		       (this.hover  && this.config.hover  && this.config.hover [type]) ||
		        this.config[type] || null;
		                  
	},
	drawTo : function (ctx) {
		var fill   = this.getStyle('fill');
		var	stroke = this.getStyle('stroke');
		fill   && ctx.fill  (this.getShape(), fill  );
		stroke && ctx.stroke(this.getShape(), stroke);
		return this;
	},
	draw : function () {
		this.drawTo(this.libcanvas.ctx);
		return this;
	}
});

})();