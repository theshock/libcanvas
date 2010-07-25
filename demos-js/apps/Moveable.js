Apps.Moveable = new Class({
	Extends : Interface.Interface,
	run : function () {
		this.getCircle().bind('away:mousedown', function (event, e) {
			this.moveTo(new LibCanvas.Point(e.offsetX, e.offsetY), $random(70, 250));
		});
	},
	getCircle : function () {
		return this.helper.createRandom('circle').listenMouse();
	}
});