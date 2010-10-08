LibCanvas.Utils.Storage = new Class({
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
		var st = this.getStorage();
		name += '\0';
		if (!st[name]) {
			st[name] = {};
		}
		this.scope = st[name];
		return this;
	},
	keys : function () {
		var keys = [];
		$each(this.store, function (val, key) {
			keys.push(key);
		});
		return key;
	},
	values : function () {
		var values = [];
		$each(this.store, function (val) {
			values.push(val);
		});
		return values;
	},
	has : function (name) {
		return (name in this.store);
	},
	get : function (name) {
		return this.has(name) ? this.store[name] : null;
	},
	set  : function (name, value) {
		arguments.length == 1 && typeof name == 'object' ?
			$extend(this.store, name) : (this.store[name] = value);
		return this;
	}
});