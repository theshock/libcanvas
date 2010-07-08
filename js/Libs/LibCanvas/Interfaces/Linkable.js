LibCanvas.Interfaces.Linkable = new Class({
	links : null,
	moveLinks : function (move) {
		(this.links || []).each(function (elem) {
			elem
				.getShape()
				.move(move);
		});
		return this;
	},
	// todo : fix recursion while linkin 2 elements between each other
	link : function (obj) {
		if (this.links === null) {
			this.links = [];
			var origMove = this.getShape().move;
			var linkable = this;
			this.getShape().move = function (move) {
				origMove.apply(linkable.getShape(), arguments);
				linkable.bind('shapeMoved', [move]);
			};
			this.bind('shapeMoved', function (move) {
				this.moveLinks(move);
			}.bind(this));
		}
		this.links.include(obj);
		return this;
	},
	unlink : function (obj) {
		if (this.links !== null) {
			if (obj) {
				this.links.erase(obj);
			} else {
				this.links = [];
			}
		}
		return this;
	}
});