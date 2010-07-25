Isometric.Object = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	x : 0,
	y : 0,
	z : 0,
	grid : null,
	initialize : function () {
		$(window).addEvent('keydown', function(event){
			this.move({
				up    : 'forward',
				down  : 'back',
				right : 'right',
				left  : 'left',
				a     : 'top',
				z     : 'bottom'
			}[event.key]);
			return false;
		}.bind(this));

	},
	move : function (dir) {
		if (this.moving) {
			return this;
		}
		switch (dir) {
			case 'forward' : this.x++; break;
			case 'back'    : this.x--; break;
			case 'right'   : this.y++; break;
			case 'left'    : this.y--; break;
			case 'top'     : this.z++; break;
			case 'bottom'  : this.z--; break;
		}
		this.moving = true;
		this.shadowCenter.moveTo(this.grid.getPoint({
			x : this.x,
			y : this.y,
			z : 0
		}), 100);
		this.center.moveTo(this.grid.getPoint({
			x : this.x,
			y : this.y,
			z : this.z
		}), 100).bind('moved', function () {
			this.canvas.update();
		}.bind(this)).bind('stopMove', function () {
			this.moving = false;
		}.bind(this));
		this.canvas.update();
		return this;
	},
	setGrid : function (grid) {
		this.grid = grid;
		this.center = this.grid.getPoint({
			x : this.x,
			y : this.y,
			z : this.z
		});
		this.shadowCenter = this.grid.getPoint({
			x : this.x,
			y : this.y,
			z : 0
		});
		return this;
	},
	draw : function () {

		this.canvas.ctx.fill(
			new LibCanvas.Shapes.Circle({
				center : this.shadowCenter,
				radius : 3,
			})
		, '#666');
		this.canvas.ctx.fill(
			new LibCanvas.Shapes.Circle({
				center : this.center,
				radius : 8,
			})
		, '#f00');
	}
});