/*
---

name: "Plugins.ImagePrototype"

description: "Provides some Image extensions"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Utils.Image

provides: Plugins.ImagePrototype

...
*/

// <image> tag
atom.core.append(HTMLImageElement.prototype, {
	createSprite: function (rect) {
		return UtilsImage.mix(this).createSprite(rect);
	},
	toCanvas: function () {
		return UtilsImage.mix(this).toCanvas();
	},
	sprite : function () {
		var utils = UtilsImage.mix(this);

		return utils.sprite.apply( utils, arguments );
	},
	isLoaded : function () {
		return UtilsImage.isLoaded(this);
	}
});

// mixin from image
atom.core.append(HTMLCanvasElement.prototype, {
	createSprite : HTMLImageElement.prototype.createSprite,
	sprite   : HTMLImageElement.prototype.sprite,
	isLoaded : atom.fn.lambda(true),
	toCanvas : atom.fn.lambda()
});