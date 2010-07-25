Isometric.Start = new Class({
	initialize : function (libcanvas) {
		this.libcanvas = libcanvas;
		libcanvas.addProcessor('pre',
			new LibCanvas.Processors.Clearer('#efebe7')
		).start();
		var grid = new Isometric.Grid;
		libcanvas.addElement(grid);
		libcanvas.addElement(
			new Isometric.Object().setGrid(grid)
		);
	}
});