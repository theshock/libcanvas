/*
---
description: Made possible link between two canvas objects

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Linkable]
*/ 

LibCanvas.namespace('Behaviors').Linkable = atom.Class({
	links : null,
	moveLinks : function (move) {
		(this.links || []).forEach(function (elem) {
			elem.getShape().move(move);
		});
		return this;
	},
	// todo : fix recursion while linkin 2 elements between each other
	link : function (obj) {
		if (this.links === null) {
			this.links = [];
			this.getShape().bind('move',
				this.moveLinks.context(this)
			);
		}
		this.links.include(obj);
		return this;
	},
	unlink : function (obj) {
		if (this.links !== null) {
			if (obj) this.links.erase(obj);
			else this.links = [];
		}
		return this;
	}
});