LibCanvas.Interfaces.Linkable = new Class({
	links : null,
	link : function (obj, backLink) {
		if (this.links === null) {
			this.links = [];
			this.bind('moveDrag', function (move) {
				this.links.each(function (elem) {
					elem.getShape().move(move);
				});
			}.bind(this));
		}
		this.links.push(obj);
		if (backLink) {
			obj.link(this);
		}
		return this;
	},
	unlink : function (obj) {
		if (this.links !== null) {
			this.links.erase(obj);
		}
		return this;
	}
});