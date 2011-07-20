/*
---

name: "Behaviors.DrawableSprite"

description: "Abstract class for drawable canvas sprites"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Drawable

provides: Behaviors.DrawableSprite

...
*/

var DrawableSprite = LibCanvas.Behaviors.DrawableSprite = Class({
	Extends: Drawable,

	draw: function () {
		this.libcanvas.ctx.drawImage( this.sprite, this.shape );
		return this;
	}
});