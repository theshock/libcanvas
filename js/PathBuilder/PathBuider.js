var PathBuilder = new Class({
	initialize : function (canvas) {
		this.canvas = canvas;
		if (window.arg) {
			this.showPath(window.arg);
		} else {
			this.createBuilder();
			this.createLinks();
		}
	},
	showPath : function (str) {
		var rp = new PathBuilder.ReadyPath()
			.setShape(new LibCanvas.Shapes.Path.Builder().build(str));
		this.canvas.addElement(rp);
		rp.listenMouse()
			.draggable()
			.clickable()
			.bind(['moveDrag', 'statusChanged'], canvasUpdate(this));
	},
	createBuilder : function () {
		this.builder = new PathBuilder.ArcBuilder();
		this.canvas.addElement(this.builder);
	},
	createLinks: function () {
		var links = new PathBuilder.Links();
		this.canvas.addElement(links);
		var fn = function () {
			alert(this.text);
		};
		var builder = this.builder;
		links.addButton('arc(acw)' , function () {
			builder['arc'](true);
		});
		['arc', 'move', 'line', 'curve', 'pop'].each(function (elem) {
			links.addButton(elem , function () {
				builder[elem]();
			});
		});
		links.addButton('show' , function () {
			window.open(window.location + '&arg=' + builder.shape.string());
		});

		this.canvas.update();
	}
});

var canvasUpdate = function (bind) {
	return function () {
		this.canvas.update();
	}.bind(bind);
}