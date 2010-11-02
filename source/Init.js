/*
---
description: LibCanvas initialization

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>
- Anna Shurubey aka Nutochka <nutochka1@i.ua>
- Nikita Baksalyar <nikita@baksalyar.ru>

provides: [LibCanvas]
*/

window.LibCanvas = {
	Inner : {
		Canvas2D : {}
	},
	Ui : {},
	Shapes  : {},
	Utils   : {},
	Engines : {
		TopDown : {}
	},
	Processors : {},
	Behaviors : {}
};


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

	LibCanvas.extract = function (to, what) {
		var i;
		for (i in {Shapes : 1, Behaviors : 1, Utils : 1}) {
			if (!what || what.contains(i)) {
				$extend(to, LibCanvas[i]);
			}
		}
		for (i in {Point : 1, Animation : 1, Buffer : 1}) {
			if (!what || what.contains(i)) {
				to[i] = LibCanvas[i];
			}
		}
		return to;
	};
})();