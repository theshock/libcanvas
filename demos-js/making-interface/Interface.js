Interface.Interface = new Class({
	initialize : function (libcanvas) {
		libcanvas.addProcessor('pre',
			new LibCanvas.Processors.Clearer('#efebe7')
		).start();

		this.libcanvas = libcanvas;
		this.helper = new Interface.Helper(libcanvas);
		this.run();
	}
});