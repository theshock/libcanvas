Solitaire.FlippableDeck = new Class({
	Extends : Solitaire.Deck,
	flipped : [],
	renderFlipTo  : null,
	lastZ   : 15,
	initialize : function () {
		this.setZIndex(10)
			.bind('click', function () {
				this.flip();
			}.bind(this));
	},
	flip : function () {
		var last = this.getLast();
		if (last) {
			this.flipped.push(last);
			this.canvas.update();

			if (last.canvas) {
				last.shape.from = Solitaire.createCardShape(
					this.renderFlipTo
				).from;
			} else {
				last
					.setCanvas(this.canvas)
					.setShape(Solitaire.createCardShape(
						this.renderFlipTo
					).bind('moved', function () {
						last.canvas.update();
					}));
				this.bindEvents(last);
			}
			last.setZIndex(this.lastZ++);
			last.container = this.flipped;
		} else {
			this.turnBack();
		}
		return this;
	},
	initDrop : function (card) {
		this.Solitaire.containers.each(function (container) {
			card.drop(container);
		});
		this.Solitaire.cells.each(function (cell) {
			card.drop(cell);
		});
		return card;
	},
	bindEvents : function (card) {
		this.initDrop(card)
			.bind('dropped', function (to) {
				if (to && to.addCard && to.addCard(card)) {
					this.flipped.erase(card);
					return 'unbind';
				} else {
					card.returnToStart(Solitaire.config.card.speed);
				}
				return null;
			}.bind(this));
	},
	flipShape : function (shape) {
		this.renderFlipTo = shape;
		return this;
	},
	findFlipped : function (shift) {
		var L = this.flipped.length;
		return L >= shift ? this.flipped[L - shift] : null;
	},
	previous : function (shift) {
		return this.findFlipped(2 + (shift || 0));
	},
	current : function () {
		return this.findFlipped(1);
	},
	drawCard : function (card, frezzed) {
		if (card) {
			card.listenMouse(frezzed)
				.draggable(frezzed)
				.draw()
		}
		return card;
	},
	draw : function () {
		this.parent();
		this.canvas.ctx.stroke(this.renderFlipTo);
		this.drawCard(this.previous(), true);
		this.drawCard(this.current());
		return this;
	},
	turnBack : function () {
		this.inDeck  = this.flipped;
		this.flipped = [];
		this.canvas.update();
		this.inDeck.each(function(card) {
			card.container = this.inDeck;
		}.bind(this));
		return this;
	}
});