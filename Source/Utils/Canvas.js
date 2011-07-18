/*
---

name: "Utils.Canvas"

description: "Provides some Canvas extensions"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Utils.Canvas

...
*/

atom.extend(HTMLCanvasElement, {
	_newContexts: {},
	addContext: function (name, ctx) {
		this._newContexts[name] = ctx;
		return this;
	},
	getContext: function (name) {
		return this._newContexts[name] || null;
	}
});

atom.implement(HTMLCanvasElement, {
	getOriginalContext: HTMLCanvasElement.prototype.getContext,
	getContext: function (type) {
		if (!this.contextsList) {
			this.contextsList = {};
		}

		if (!this.contextsList[type]) {
			var ctx = HTMLCanvasElement.getContext(type);
			if (ctx) {
				ctx = new ctx(this);
			} else try {
				ctx = this.getOriginalContext.apply(this, arguments);
			} catch (e) {
				throw (!e.toString().match(/NS_ERROR_ILLEGAL_VALUE/)) ? e :
					new TypeError('Wrong Context Type: «' + type + '»');
			}
			this.contextsList[type] = ctx;
		}
		return this.contextsList[type];
	}
});