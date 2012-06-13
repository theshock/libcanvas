/*
---

name: "Core.Canvas"

description: "Provides some Canvas extensions"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Core.Canvas

...
*/

atom.core.append(HTMLCanvasElement,
/** @lends HTMLCanvasElement */
{
	/** @private */
	_newContexts: {},
	/** @returns {HTMLCanvasElement} */
	addContext: function (name, ctx) {
		this._newContexts[name] = ctx;
		return this;
	},
	/** @returns {Context2D} */
	getContext: function (name) {
		return this._newContexts[name] || null;
	}
});

atom.core.append(HTMLCanvasElement.prototype,
/** @lends HTMLCanvasElement.prototype */
{
	getOriginalContext: HTMLCanvasElement.prototype.getContext,
	/** @returns {Context2D} */
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