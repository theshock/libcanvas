/*
---

name: "Behaviors.Moveable"

description: "Provides interface for moveable objects"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Animatable

provides: Behaviors.Moveable

...
*/
var Moveable = LibCanvas.Behaviors.Moveable = Class({
	stopMoving : function () {
		var anim = this['moveTo.animation'];
		if (anim) anim.stop();
		return this;
	},
	moveTo    : function (point, speed, fn) { // speed == pixels per sec
		this.stopMoving();
		point = Point(point);
		var shape = this.shape, diff = shape.getCoords().diff(point);
		if (!speed) {
			shape.move(diff);
			this.fireEvent('stopMove');
			return this;
		}
		var distance = Math.hypotenuse(diff.x, diff.y), prev = 0;

		this['moveTo.animation'] = new Animatable(function (change) {
			shape.move({
				x : diff.x * (change - prev),
				y : diff.y * (change - prev)
			});
			prev = change;
		}).animate({
			fn        : fn || 'linear',
			time      : distance / speed * 1000,
			onProcess : this.fireEvent.bind(this, 'move'),
			onAbort   : this.fireEvent.bind(this, 'stopMove'),
			onFinish  : this.fireEvent.bind(this, 'stopMove')
		});

		return this;
	}
});