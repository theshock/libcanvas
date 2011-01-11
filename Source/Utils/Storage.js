/*
---

name: "LibCanvas.Utils.StopWatch"

description: "StopWatch"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
- "Shock <shocksilien@gmail.com>"

requires:
- LibCanvas

provides: LibCanvas.Utils.StopWatch

...
*/


LibCanvas.namespace('Utils').Storage = atom.Class({
	initialize : function () {
		this.store = this.getStorage();
	},
	getStorage : function () {
		return 'localStorage' in window ?
			window.localStorage :
			window.sessionStorage;
	},
	store : '',
	setScope : function (name) {
		var st = this.store;
		name += '\0';
		if (!st[name]) st[name] = {};
		this.scope = st[name];
		return this;
	},
	keys : function () {
		return Object.keys(this.store);
	},
	values : function () {
		var values = [];
		for (var i in this.store) values.push(this.store[i]);
		return values;
	},
	has : function (name) {
		return (name in this.store);
	},
	get : function (name) {
		return this.has(name) ? this.store[name] : null;
	},
	set  : function (name, value) {
		typeof name == 'object' ?
			atom.extend(this.store, name) : (this.store[name] = value);
		return this;
	}
});