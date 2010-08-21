/*
---
description: Made possible link between two canvas objects

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Linkable]
*/ 

LibCanvas.Behaviors.Linkable = new Class({
	links : null,
	moveLinks : function (move) {
		(this.links || []).each(function (elem) {
			elem
				.getShape()
				.move(move);
		});
		return this;
	},
	// todo : fix recursion while linkin 2 elements between each other
	link : function (obj) {
		if (this.links === null) {
			this.links = [];
			this.getShape().bind('moved', function (move) {
				this.moveLinks(move);
			}.bind(this));
		}
		this.links.include(obj);
		return this;
	},
	unlink : function (obj) {
		if (this.links !== null) {
			if (obj) {
				this.links.erase(obj);
			} else {
				this.links = [];
			}
		}
		return this;
	}
});