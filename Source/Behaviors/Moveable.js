/*
---

name: "Behaviors.Moveable"

description: "Provides interface for moveable objects"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Animatable

provides: Behaviors.Moveable

...
*/
LibCanvas.namespace('Behaviors').Moveable = atom.Class({
	stopMoving : function () {
		var sm = this.stopMoving;
		if (sm.animation) {
			sm.animation.stop();
			sm.animation = null;
		}
		return this;
	},
	moveTo    : function (point, speed, fn) { // speed == pixels per sec
		this.stopMoving();
		point = LibCanvas.Point.from(point);
		var diff = this.getCoords().diff(point), shape = this.getShape();
		if (!speed) {
			shape.move(diff);
			return this;
		}
		var distance = Math.hypotenuse(diff.x, diff.y), prev = 0;
		this.stopMoving.animation = new LibCanvas.Behaviors.Animatable(function (change) {
			shape.move({
				x : diff.x * (change - prev),
				y : diff.y * (change - prev)
			});
			prev = change;
		}).animate({
			fn        : fn,
			time      : distance / speed * 1000,
			onProccess: this.fireEvent.context(this, ['onMove']),
			onFinish  : this.fireEvent.context(this, ['stopMove'])
		});

		return this;
	}
});