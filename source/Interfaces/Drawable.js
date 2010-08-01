/*
---
description: Abstract class for drawable canvas objects

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Interfaces.Drawable]
*/ 

LibCanvas.Interfaces.Drawable = new Class({
	Implements : LibCanvas.Interfaces.Bindable,
	setLibcanvas : function (libcanvas) {
		this.libcanvas = libcanvas;
		this.autoBind('libcanvasSet');
		this.libcanvas.bind('ready', function () {
			this.autoBind('libcanvasReady');
		}.bind(this));
		return this;
	},
	getCoords : function () {
		return this.shape.getCoords();
	},
	getShape : function () {
		return this.shape;
	},
	setShape : function (shape) {
		this.shape = shape;
		return this;
	},
	getZIndex : function () {
		return this.zIndex || 0;
	},
	setZIndex : function (zIndex) {
		this.zIndex = zIndex;
		return this;
	},
	draw : function () {
		throw 'Abstract method "draw"';
	}
});