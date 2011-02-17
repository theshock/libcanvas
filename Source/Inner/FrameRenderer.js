/*
---

name: "Inner.FrameRenderer"

description: "Private class for inner usage in LibCanvas.Canvas2D"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Utils.Trace

provides: Inner.FrameRenderer

...
*/

LibCanvas.namespace('Inner').FrameRenderer = atom.Class({
	checkAutoDraw : function () {
		if (this.autoUpdate == 'onRequest') {
			if (this.updateFrame) {
				this.updateFrame = false;
				return true;
			}
		} else if (this.autoUpdate) return true;
		return false;
	},
	show : function () {
		console.log(this.origCtx);
		this.origCtx.clearAll();
		this.origCtx.drawImage(this.elem);
		return this;
	},
	drawAll : function () {
		var elems = this.elems.sortBy('getZIndex');
		for (var i = elems.length; i--;) elems[i].draw();
		return this;
	},
	processing : function (type) {
		this.processors[type].forEach(function (processor) {
			if ('process' in processor) {
				processor.process(this);
			} else if ('processCanvas' in processor) {
				processor.processCanvas(this.elem);
			} else if ('processPixels' in processor) {
				this.ctx.putImageData(
					processor.processCanvas(
						this.ctx.getImageData()
					)
				);
			}
		}.context(this));
		return this;
	},
	renderFrame : function () {
		if (this.checkAutoDraw()) {
			this.processing('pre');
			this.isReady() ?
				this.drawAll() :
				this.renderProgress();
			this.processing('post');

			if (this.elem != this.origElem) this.show();
			return true;
		}
		return false;
	}
});