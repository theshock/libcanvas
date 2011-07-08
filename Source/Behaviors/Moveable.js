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
LibCanvas.Behaviors.Moveable = atom.Class({
	stopMoving : function () {
		var anim = this['moveTo.animation'];
		if (anim) anim.stop();
		return this;
	},
	moveTo    : function (point, speed, fn) { // speed == pixels per sec
		this.stopMoving();
		point = LibCanvas.Point(point);
		var diff = this.getCoords().diff(point), shape = this.getShape();
		if (!speed) {
			shape.move(diff);
			this.fireEvent('stopMove');
			return this;
		}
		var distance = Math.hypotenuse(diff.x, diff.y), prev = 0;

		this['moveTo.animation'] = new LibCanvas.Behaviors.Animatable(function (change) {
			shape.move({
				x : diff.x * (change - prev),
				y : diff.y * (change - prev)
			});
			prev = change;
		}).animate({
			fn        : fn || 'linear',
			time      : distance / speed * 1000,
			onProcess : this.fireEvent.context(this, ['move']),
			onAbort   : this.fireEvent.context(this, ['stopMove']),
			onFinish  : this.fireEvent.context(this, ['stopMove'])
		});

		return this;
	}
});