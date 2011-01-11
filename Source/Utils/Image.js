/*
---

name: "Utils.Image"

description: "Provides some Image extensions"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Shapes.Rectangle

provides: Utils.Image

...
*/

new function () {

var LibCanvas = window.LibCanvas,
	Buffer    = LibCanvas.Buffer,
	Rectangle = LibCanvas.Shapes.Rectangle;

// <image> tag
atom.implement(HTMLImageElement, {
	sprite : function () {
		if (!this.isLoaded()) {
			atom.log('Not loaded in Image.sprite: ', this);
			throw new Error('Not loaded in Image.sprite, logged');
		}
		var buf, bigBuf, rect, index;
		this.spriteCache = this.spriteCache || {};
		if (arguments.length) {
			rect = Rectangle.factory(arguments);
			index = [rect.from.x,rect.from.y,rect.getWidth(),rect.getHeight()].join('.');
			buf = this.spriteCache[index];
			if (!buf) {
				buf    = Buffer(rect.getWidth(), rect.getHeight(), true);
				bigBuf = Buffer(this.width*2   , this.height*2   , true);
				for (var y = 0; y < 2; y++) for (var x = 0; x < 2; x++) {
					bigBuf.ctx.drawImage({
						image : this,
						from : [this.width*x,this.height*y]
					});
				}
				buf.ctx.drawImage({
					image : bigBuf,
					crop  : rect,
					draw  : [0,0,rect.getWidth(),rect.getHeight()]
				});
				bigBuf.ctx.clearAll();
				this.spriteCache[index] = buf;
			}

		} else {
			buf = this.spriteCache[0];
			if (!buf) {
				this.spriteCache[0] = buf = Buffer(this.width, this.height);
				buf.ctx.drawImage(this);
			}
		}
		return buf;
	},
	isLoaded : function () {
		if (!this.complete) return false;
		return this.naturalWidth == null || this.naturalWidth;
	}
});

}();