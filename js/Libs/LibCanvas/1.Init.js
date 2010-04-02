

window.LibCanvas = window.$lc = {};
window.LibCanvas.Shapes = {};


(function () {
	// Changing HTMLCanvasElement.prototype.getContext, so we
	// can create our own contexts by LibCanvas.addCanvasContext(name, ctx);
	var newCtxs = {};
	var oldGetContext = HTMLCanvasElement.prototype.getContext;

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
					ctx = oldGetContext.apply(this, arguments);
				} catch (e) {
					throw (!e.toString().test(/NS_ERROR_ILLEGAL_VALUE/)) ? e :
						'Wrong Context Type : "' + type + '"';
				}
			}
			this.contextsList[type] = ctx;
		}
		return this.contextsList[type];
	};

	HTMLCanvasElement.prototype.getOriginalContext = oldGetContext;

	LibCanvas.addCanvasContext = function (name, ctx) {
		newCtxs[name] = ctx;
		return this;
	};
})();