Solitaire.ResultContainer = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	cards : [],
	addCard : function (card) {
		if (this.canPush(card)) {
			this.cards.push(
				card.moveTo(this.getShape(), Solitaire.config.card.speed)
					.unbind('startDrag')
					.unbind('stopMove')
					.unbind('dropped')
					.draggable(true)
			);
			this.checkAll();
			return true;
		}
		return false;
	},
	canPush : function (card) {
		return (!this.current() && card.rank == 'a')
			|| card.isNextTo(this.current());
	},
	current : function () {
		var L = this.cards.length;
		return L ? this.cards[L-1] : null;
	},
	draw : function () {
		if (!this.winned && this.current()) {
			this.current().draw();
		} else {
			this.canvas.ctx.stroke(
				this.getShape()
			);
		}
		return this;
	},
	checkAll : function () {
		var kings = 0;
		this.Solitaire.containers.each(function (cont) {
			if (cont.cards.length == 13) {
				kings++;
			}
		});
		if (kings == 4) {
			this.win();
		}
	},
	dropAll : function () {
		this.cards.each(function (card) {
			card.setZIndex($random(60, 600))
				.moveTo({
					x : $random(0, this.canvas.elem.width),
					y : $random(0, this.canvas.elem.height)
				}, 200);
			this.canvas.addElement(card.draggable().unlink());
		}.bind(this));
	},
	win : function () {
		this.winned = true;
		this.Solitaire.containers.each(function (cont) {
			cont.dropAll();
		});
		(function () {
			alert('Congradulations!');
		}).delay(3000);

	}
});