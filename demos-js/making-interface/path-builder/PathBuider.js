var PathBuilder = new Class({
	initialize : function (libcanvas, code) {
		libcanvas.addProcessor('pre',
			new LibCanvas.Processors.Clearer('#efebe7')
		).start();
		this.canvas = libcanvas;
		this.code   = code;
		this.createBuilder();
		this.createLinks();
	},
	showPath : function (str) {
		var rp = new PathBuilder.ReadyPath()
			.setShape(new LibCanvas.Shapes.Path.Builder().build(str));
		this.canvas.addElement(rp);
		rp.listenMouse()
			.draggable()
			.clickable()
			.bind(['moveDrag', 'statusChanged'], updateCanvas(this.canvas));
	},
	createBuilder : function () {
		this.canvas.addElement(
			this.builder = new PathBuilder.ArcBuilder()
		);
	},
	createLinks: function () {
		var links = new PathBuilder.Links();
		this.canvas.addElement(links).update();
		
		['arc', 'arc(acw)', 'move', 'line', 'curve', 'pop', 'code'].each(function (elem) {
			links.addButton(elem , function () {
				if (elem == 'code') {
					alert(this.builder.shape.string());
				} else if (elem == 'arc(acw)') {
					this.builder['arc'](true);
				} else {
					this.builder[elem]();
				}
			}.bind(this));
		}.bind(this));
	}
});
