window.App = window.App || {};

(function () {

var ts = [
	new LibCanvas.Utils.Trace(),
	new LibCanvas.Utils.Trace(),
	new LibCanvas.Utils.Trace(),
	new LibCanvas.Utils.Trace()
];

App.ControllPoint = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	Implements : [
		LibCanvas.Interfaces.MouseListener,
		LibCanvas.Interfaces.Draggable,
	],
	initialize : function (point, color) {
		this.shape = new LibCanvas.Shapes.Circle({
			center : point,
			radius : 4
		});
		this.color = color;
	},
	draw : function () {
		this.canvas.ctx
			.set('lineWidth', 1)
			.fill(this.shape, this.color)
			.stroke(this.shape, '#000');
	}
});

App.TestPath = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	Implements : [
		LibCanvas.Interfaces.MouseListener,
		LibCanvas.Interfaces.Draggable,
	],
	draw : function () {
		this.canvas.ctx
			.set('lineWidth', 3)
			.stroke(this.path, '#f60');
	}
});

App.TestShape = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	makeCp : function (index, x, y, color) {
		var p = new LibCanvas.Point(x, y);
		this.canvas.addElement(
			new App.ControllPoint(p, color)
				.listenMouse()
				.draggable()
				.bind('moveDrag', function () {
					this.canvas.update();
				})
		);
		this.cps[index] = p;
		return p;
	},
	draw : function () {
		var ctx = this.canvas.ctx;
		
		if (!this.cps) {
			this.cps = {};
			this.makeCp('drag1', 150, 150, '#0f0');
			this.makeCp('drag2', 165, 150, '#0f0');
			this.makeCp('drag3', 180, 150, '#0f0');
			
			this.path = new LibCanvas.Shapes.Path
				.Builder()
				.move(this.makeCp('ls', 511, 205, '#ff0'))
				.curve({
					p1 : this.makeCp('lsp1', 496, 202, '#0ff'),
					p2 : this.makeCp('lsp2', 475, 225, '#f0f'),
					to : this.makeCp('lf', 477, 242, '#ff0'),
				})
				.curve({
					p1 : this.makeCp('lfp1', 490, 250, '#0ff'),
					p2 : this.makeCp('lfp2', 519, 220, '#f0f'),
					to : this.cps['ls'],
				})
				.move(this.makeCp('a1', 545, 264, '#ff0'))
				.curve({
					p1 : this.makeCp('a2p1', 512, 270, '#0ff'),
					p2 : this.makeCp('a2p2', 518, 328, '#f0f'),
					to : this.makeCp('a2', 548, 331, '#ff0')
				})
				.curve({
					p1 : this.makeCp('a3p1', 536, 354, '#0ff'),
					p2 : this.makeCp('a3p2', 530, 393, '#f0f'),
					to : this.makeCp('a3', 483, 372, '#ff0')
				})
				.curve({
					p1 : this.makeCp('a4p1', 464, 366, '#0ff'),
					p2 : this.makeCp('a4p2', 450, 406, '#f0f'),
					to : this.makeCp('a4', 417, 341, '#ff0')
				})
				.curve({
					p1 : this.makeCp('a5p1', 381, 260, '#0ff'),
					p2 : this.makeCp('a5p2', 446, 238, '#f0f'),
					to : this.makeCp('a5', 460, 246, '#ff0')
				})
				.curve({
					p1 : this.makeCp('a6p1', 491, 266, '#0ff'),
					p2 : this.makeCp('a6p2', 508, 220, '#f0f'),
					to : this.cps['a1']
				})
				.build();

			this.canvas.addElement(
				new App.TestPath()
					.setShape(this.path)
					.listenMouse()
					//.draggable()
					.bind('moveDrag', function () {
						this.canvas.update();
					})
			);
			this.canvas.update();
		}

		ctx.drawImage({
			image : this.canvas.getImage('apple'),
			from  : [400, 200]
		});
		var inPath = function (index) {
			return this.path.hasPoint(this.cps[index]) ? 'yes' : 'no';
		}.bind(this);
		ctx.set('lineWidth', 3).stroke(this.path, '#f60');
		ts[0].trace('Dot 0 in apple: ' + inPath('drag1'));
		ts[1].trace('Dot 1 in apple: ' + inPath('drag2'));
		ts[2].trace('Dot 2 in apple: ' + inPath('drag3'));
	}
});

})();