Isometric.Grid = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	getGrid : function () {
		if (!this.grid) {
			this.grid = this.canvas.createBuffer(160, 120);
			this.grid.getContext('2d-libcanvas')
				.beginPath()
				.moveTo(0, 0)
				.lineTo(160, 80)
				.lineTo(80, 120)
				.lineTo(0, 80)
				.lineTo(160, 0)
				.lineTo(80, -80)
				.closePath()
				.stroke('#ccc')
				.beginPath()
				.moveTo(0, 120)
				.lineTo(160, 40)
				.lineTo(80, 0)
				.lineTo(0, 40)
				.lineTo(160, 120)
				.lineTo(80, 160)
				.closePath()
				.stroke('#ccc');
		}
		return this.grid;
	},
	getBigGrid : function () {
		if (!this.bigGrid) {
			this.bigGrid = this.canvas.createBuffer();
			for(var y = 0; y < (this.bigGrid.height / 120).ceil(); y++) {
				for(var x = 0; x < (this.bigGrid.width  / 160).ceil(); x++) {
					this.bigGrid.getContext('2d-libcanvas').drawImage({
						image : this.getGrid(),
						from  : [x*160, y*120]
					});
				}
			}
		}
		return this.bigGrid;
	},
	getPoint : function (coord) {
		var zero = new LibCanvas.Point(this.canvas.elem.width/2, this.canvas.elem.height/2);
		zero.move({
			x :  40*coord.x,
			y : -20*coord.x
		});
		zero.move({
			x : 40*coord.y,
			y : 20*coord.y
		});
		zero.move({
			x : 0,
			y : -40*coord.z
		});
		return zero;
	},
	draw : function () {
		this.canvas.ctx.drawImage({
			image : this.getBigGrid(),
			from  : [0,0]
		});
	}
});