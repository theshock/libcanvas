LibCanvas.Engines.TopDown.Unit = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	Implements : [
		LibCanvas.Interfaces.Bindable
	],
	initialize : function (field, image) {
		this.field = field;
		this.image = image;
	},
	setCoord : function (point) {
		this.cellCoord = new LibCanvas.Point(point);
		this.coord = new LibCanvas.Point(
			this.field.getCoord(point)
		);
		return this;
	},
	angle : 0,
	rotateTo : function (dir, fn) {
		if (this.interval) {
			return;
		}
		var angle =
			dir == 'top'    ?   0 :
			dir == 'right'  ?  90 :
			dir == 'bottom' ? 180 : 270;
		var rotate = (angle.degree() - this.angle).normalizeAngle();
		$log(rotate.getDegree())
		if (rotate.toFixed(3) == (270).degree().toFixed(3)) {
			rotate = -(90).degree();
		}
		this.rotate(rotate, fn);
	},
	rotation : 0,
	rotate : function (angle, fn) {
		if (this.interval) {
			return this;
		}
		this.rotation = angle;
		this.interval = (function () {
			var step = (7).degree(), rotate;
			if (angle > 0) {
				rotate = this.rotation > step ? step : this.rotation;
			} else {
				step = -step;
				rotate = this.rotation < step ? step : this.rotation;
			}
			this.rotation -= rotate;
			this.angle += rotate;
			this.bind('rotate');
			if (!this.rotation) {
				this.angle = this.angle
					.normalizeAngle()
					.getDegree()
					.round(2)
					.degree();
				$clear(this.interval);
				this.interval = null;
				if (fn) {
					fn.apply(this);
				}
				this.bind('rotated');
			}
		}).bind(this).periodical(20);
		return this;
	},
	moving : 0,
	move : function (fn) {
		if (this.interval) {
			return this;
		}
		var move = function (obj, dist) {
			var newObj = $extend({}, obj);
				   if (this.angle.toFixed(3) ==  (0).degree().toFixed(3)) {
				newObj.y -= dist;
			} else if (this.angle.toFixed(3) == (90).degree().toFixed(3)) {
				newObj.x += dist;
			} else if (this.angle.toFixed(3) == (180).degree().toFixed(3)) {
				newObj.y += dist;
			} else  {
				newObj.x -= dist;
			}
			return newObj;
		}.bind(this);

		var nextCell = move(this.cellCoord, 1);
		var tile = this.field.map.matrix[nextCell.y][nextCell.x];
		if (!this.field.cells[tile].traverse.contains(this.type)) {
			return this;
		}

		this.moving = this.field.width;
		this.interval = (function () {
			var step  = 4;
			var shift = this.moving > step ? step : this.moving;
			this.moving -= shift;
			this.coord = move(this.coord, step);
			this.bind('move');
			if (!this.moving) {
				$clear(this.interval);
				this.interval = null;
				this.cellCoord = nextCell;
				this.bind('moved');
				if (fn) {
					fn.apply(this);
				}
			}
		}).bind(this).periodical(20);
		return this;
	},
	moveTo : function (point) {
		var tile = this.field.map.matrix[point.y][point.x];
		if (!this.field.cells[tile].traverse.contains(this.type)) {
			return;
		}
		this.setCoord(point);
		this.bind('movedTo', [point]);
	},
	draw : function () {
		if (this.hidden) {
			return;
		}
		var center = {
			x : this.coord.x + (this.image.width / 2),
			y : this.coord.y + (this.image.height / 2)
		};
		this.canvas.ctx
			.save()
			.translate(center.x, center.y)
			.rotate(this.angle)
			.translate(-center.x, -center.y)
			.drawImage({
				image : this.image,
				from  : this.coord
			})
			.restore();
	}
});