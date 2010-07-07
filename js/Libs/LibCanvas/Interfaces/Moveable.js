LibCanvas.Interfaces.Moveable = new Class({
	moving : {
		interval : null,
		speed : 0, // pixels per sec
		to : null
	},
	getCoords : function () {
		throw 'Abstract method "getCoords"';
	},
	stopMoving : function () {
		$clear(this.moving.interval);
		return this;
	},
	moveTo    : function (dot, speed) {
		this.stopMoving();
		this.moving.speed = speed = (speed || this.moving.speed);
		if (!speed) {
			this.getShape().move(
				this.getCoords().diff(dot)
			);
			return this;
		}
		this.moving.interval = function () {
			var move = {}, pixelsPerFn = speed / 20;
			var diff = this.getCoords().diff(dot);
			var distance = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
			if (distance > pixelsPerFn) {
				move.x = diff.x * (pixelsPerFn / distance);
				move.y = diff.y * (pixelsPerFn / distance);
			} else {
				move.x = diff.x;
				move.y = diff.y;
				this.stopMoving();
				this.bind('stopMove');
			}
			this.getShape().move(move);
		}.bind(this).periodical(20);
		return this;
	}
});