(function () {

var S = LibCanvas.Shapes;

Apps.DesktopEnv = new Class({
	Extends  : Interface.Interface,
	elements : {},
	run : function () {
		this.createElements()
		    .linkElements()
		    .createShortcut();
	},
	createElements : function () {
		$extend(this.elements, {
			'window' : this.helper
				.create(new S.Rectangle([
					250, 150, 400, 200
				]), 40),
			'close' : this
				.createClickable(new S.Rectangle([
					615, 115, 20, 20
				]), 60)
				.bind('click', this.getChangeFn('rm')),
			'header' : this.helper
				.createDraggable(new S.Rectangle([
					250, 100, 400, 50
				]), 50)
		});
		return this;
	},
	linkElements : function () {
		this.elements.header
			.link(this.elements["close"])
			.link(this.elements["window"]);
		return this;
	},
	createShortcut : function () {
		this.createClickable(new S.Circle(35, 35, 25), 10)
			.bind('click', this.getChangeFn('add'));
		return this;
	},
	createClickable : function (shape, z) {
		return this.helper.create(shape, z)
			.listenMouse()
			.clickable();
	},
	getChangeFn : function (act) {
		return function () {
			var method = act + "Element";
			for (var i in this.elements) {
				this.libcanvas[method](this.elements[i]);
			}
			this.helper.update();
		}.bind(this);
	}
});

})();