LibCanvas.Interfaces.Droppable = new Class({
	drops : null,
	drop : function (obj) {
		if (this.drops === null) {
			this.drops = [];
			this.bind('stopDrag', function () {
				var mouseDot = this.canvas.mouse.dot;
				this.drops.each(function () {
					if(obj.getShape().hasDot(mouseDot)) {
						this.bind('dropped', [obj]);
					}
				}.bind(this));
			}.bind(this));
		}
		this.drops.push(obj);
		return this;
	},
	undrop : function (obj) {
		if (this.drops !== null) {
			this.drops.erase(obj);
		}
		return this;
	}
});