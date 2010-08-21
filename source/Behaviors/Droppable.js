/*
---
description: Abstract class for droppable canvas objects

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Droppable]
*/ 

LibCanvas.Behaviors.Droppable = new Class({
	drops : null,
	drop : function (obj) {
		if (this.drops === null) {
			this.drops = [];
			this.bind('stopDrag', function () {
				var dropped = false;
				var mouse = this.libcanvas.mouse;
				if (mouse.inCanvas) {
					this.drops.each(function (obj) {
						if(obj.getShape().hasPoint(mouse.point)) {
							dropped = true;
							this.bind('dropped', [obj]);
						}
					}.bind(this));
				}
				if (!dropped) {
					this.bind('dropped', [null]);
				}
			}.bind(this));
		}
		this.drops.push(obj);
		return this;
	},
	undrop : function (obj) {
		if (this.drops !== null) {
			this.drops.erase(obj);
		}
		return this;
	}
});