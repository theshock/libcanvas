/*
---
description: Provides interface for moveable objects

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Moveable]
*/

LibCanvas.Behaviors.Moveable = new Class({
	moving : {
		interval : null,
		speed : 0, // pixels per sec
		to : null
	},
	stopMoving : function () {
		$clear(this.moving.interval);
		return this;
	},
	getCoords : function () {
		return this.shape.getCoords();
	},
	moveTo    : function (point, speed) {
		this.stopMoving();
		this.moving.speed = speed = (speed || this.moving.speed);
		if (!speed) {
			this.getShape().move(
				this.getCoords().diff(point)
			);
			return this;
		}
		this.moving.interval = function () {
			var move = {}, pixelsPerFn = speed / 20;
			var diff = this.getCoords().diff(point);
			var distance = Math.hypotenuse(diff.x, diff.y);
			if (distance > pixelsPerFn) {
				move.x = diff.x * (pixelsPerFn / distance);
				move.y = diff.y * (pixelsPerFn / distance);
				this.getShape().move(move);
			} else {
				move.x = diff.x;
				move.y = diff.y;
				// @todo change move to diff
				this.getShape().move(move);
				this.stopMoving();
				this.bind('stopMove');
			}
		}.bind(this).periodical(20);
		return this;
	}
});