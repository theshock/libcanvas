/*
---
description: Provides line as a canvas object

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Shape

provides: [LibCanvas.Shapes.Line]
*/

LibCanvas.namespace('Shapes').Line = atom.Class({
	Extends: LibCanvas.Shape,
	// todo : refactoring
	set : function (from, to) {
		var a = Array.pickFrom(arguments);

		this.from = LibCanvas.Point.from(a[0] || a.from);
		this.to   = LibCanvas.Point.from(a[1] || a.to);
		
		return this;
	},
	hasPoint : function (point) {
		var max = Math.max;
		var min = Math.min;
		var fx = this.from.x;
		var fy = this.from.y;
		var tx = this.to.x;
		var ty = this.to.y;
		var px = this.point.x;
		var py = this.point.y;

		if (!( px.between(min(fx, tx), max(fx, tx))
		    && py.between(min(fy, ty), max(fy, ty))
		)) return false;

		// if triangle square is zero - points are on one line
		return ((fx-px)*(ty-py)-(tx-px)*(fy-py)).round(6) == 0;
	},
	getLength : function () {
		return this.to.distanceTo(this.from);
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) ctx.beginPath();

		ctx.moveTo(this.from).lineTo(this.to);
		
		if (!noWrap) ctx.closePath();
		return ctx;
	}
});
