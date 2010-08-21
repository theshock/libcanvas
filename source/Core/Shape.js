/*
---
description: Abstract class LibCanvas.Shape defines interface for drawable canvas objects.

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Behaviors.Bindable

provides: [LibCanvas.Shape]
*/

LibCanvas.Shape = new Class({
	Implements: [LibCanvas.Behaviors.Bindable],
	initialize : function () {
		if (arguments.length > 0) {
			this.set.apply(this, arguments);
		}
	},
	checkPoint : function (args) {
		if (args instanceof LibCanvas.Point) {
			return args;
		} else if (args.length == 2) {
			return new LibCanvas.Point(args);
		} else if (args[0] instanceof LibCanvas.Point) {
			return args[0];
		} else {
			throw 'Not a LibCanvas.Point in LibCanvas.Shape.checkPoint';
		}
	},
	move : function (distance) {
		this.bind('moved', [distance]);
		return this;
	},
	set : function (a) {
		throw 'Abstract Method Shape.set called';
	},
	hasPoint : function (a) {
		throw 'Abstract Method Shape.hasPoint called';
	},
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	}
});