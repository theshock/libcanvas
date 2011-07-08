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

LibCanvas.Behaviors.DrawableSprite = atom.Class({
	Extends: LibCanvas.Behaviors.Drawable,

	draw: function () {
		this.libcanvas.ctx.drawImage( this.sprite, this.shape );
	}
});