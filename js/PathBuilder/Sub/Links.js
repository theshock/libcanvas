PathBuilder.Links = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	buttons : [],
	addButton : function (text, onclick) {
		var count   = this.buttons.length;
		var width   = 150;
		var height  = 30;
		var margin  = 10;
		var padding = 20;
		var from = [32, 20];

		var shift = (margin + height)*count;

		var button = new PathBuilder.Button(text, padding)
			.setShape(new LibCanvas.Shapes.Rectangle({
				from : [from[0], from[1] + shift],
				size : [width, height]
			}))
			.listenMouse()
			.clickable()
			.bind('click', onclick)
			.bind('statusChanged', function () {
				this.canvas.update();
			}.bind(this));
		this.buttons.push(button);
		this.canvas.addElement(button);
	},
	draw : function () {}
});