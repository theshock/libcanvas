/*
---

name: "Inner.FrameRenderer"

description: "Private class for inner usage in LibCanvas.Canvas2D"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point

provides: Inner.FrameRenderer

...
*/

var FrameRenderer = LibCanvas.Inner.FrameRenderer = Class({
	checkAutoDraw : function () {
		if (!this._freezed && this.updateFrame) {
			this.updateFrame = false;
			return true;
		}
		return false;
	},
	showBuffer : function () {
		if (this.elem != this.origElem) {
			this.origCtx.clearAll();
			this.origCtx.drawImage(this.elem);
		}
		return this;
	},
	invokeAll : function (method, time) {
		var elems = this.elems.sortBy('getZIndex');
		for (var i = elems.length; i--;) {
			if (elems[i].isReady()) {
				elems[i][method](time);
			}
		}
		return this;
	},
	updateAll : function (time) {
		if (!this.options.invoke) return this;
		return this.invokeAll('update', time);
	},
	drawAll : function (time) {
		return this.invokeAll('draw', time);
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
		}.bind(this));
	},
	innerInvoke : function (type, time) {
		var f = this.funcs[type].sortBy('priority');
		for (var i = f.length; i--;) f[i].call(this, time);
		return this;
	},
	renderLayer: function (layer, time) {
		layer.innerInvoke('plain', time).updateAll(time);

		if (layer.checkAutoDraw()) {
			layer.processing('pre');
			if (layer.isReady()) {
				layer.innerInvoke('render', time);
				layer.drawAll(time);
			} else {
				layer.renderProgress();
			}
			layer.processing('post');
			layer.showBuffer();
			return true;
		}
		return false;
	},
	collect: 0,
	renderFrame : function (time) {
		for (var n in this._layers) {
			this.renderLayer(this._layers[n], time);
		}
		if (window.opera && ++this.collect > 100) {
			window.opera.collect();
			this.collect = 0;
		}
		return true;
	}
});