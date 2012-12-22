/*
---

name: "App.ElementsMouseSearch"

description: "LibCanvas.App.ElementsMouseSearch"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App

provides: App.ElementsMouseSearch

...
*/

/** @class App.ElementsMouseSearch */
declare( 'LibCanvas.App.ElementsMouseSearch', {

	initialize: function () {
		this.elements = [];
	},

	add: function (elem) {
		this.elements.push( elem );
		return this;
	},

	remove: function (elem) {
		atom.core.eraseOne( this.elements, elem );
		return this;
	},

	findByPoint: function (point) {
		var e = this.elements, i = e.length, result = [];
		while (i--) if (e[i].isTriggerPoint( point )) {
			result.push(e[i]);
		}
		return result;
	}

});