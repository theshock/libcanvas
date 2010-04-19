window.App = window.App || {};

App.TabSwitcher = new Class({
	elems : {},
	setTabValue : function (value) {
		if (this.active) {
			this.canvas.rmElement(this.active);
		}
		this.active = new App.TabValue({
			image : this.canvas.images[value + '-tab'],
			from  : [131, 200]
		});
		this.canvas.addElement(this.active);
		return this;
	},
	createElems : function () {
		['circle', 'octagon', 'rectangle'].each(function (name) {
			this.elems[name] = App.TabButtonCreator[name].call(this)
		}.bind(this));
		return this;
	},
	bindElems : function () {
		$H(this.elems).each(function (elem) {
			this.canvas.addElement(elem);
		}.bind(this));
		return this;
	},
	setCanvas : function (canvas) {
		this.canvas = canvas;
		this.createElems().bindElems();
		return this;
	},
	draw : function () {}
});