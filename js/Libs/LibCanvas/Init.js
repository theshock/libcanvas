

window.LibCanvas = window.$lc = {};
window.LibCanvas.Inner  = {};
window.LibCanvas.Shapes = {};
window.LibCanvas.Utils  = {};
window.LibCanvas.Interfaces  = {};


(function () {
	// Changing HTMLCanvasElement.prototype.getContext, so we
	// can create our own contexts by LibCanvas.addCanvasContext(name, ctx);
	var newCtxs = {};
	
	HTMLCanvasElement.prototype.getOriginalContext = HTMLCanvasElement.prototype.getContext;

	HTMLCanvasElement.prototype.getContext = function (type) {
		var ctx;
		if (!this.contextsList) {
			this.contextsList = {};
		}

		if (!(type in this.contextsList)) {
			if (type in newCtxs) {
				ctx = new newCtxs[type](this);
			} else {
				try {
					ctx = this.getOriginalContext.apply(this, arguments);
				} catch (e) {
					throw (!e.toString().test(/NS_ERROR_ILLEGAL_VALUE/)) ? e :
						'Wrong Context Type : "' + type + '"';
				}
			}
			this.contextsList[type] = ctx;
		}
		return this.contextsList[type];
	};


	LibCanvas.addCanvasContext = function (name, ctx) {
		newCtxs[name] = ctx;
		return this;
	};
})();