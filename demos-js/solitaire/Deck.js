Solitaire.Deck = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	Implements : [LibCanvas.Interfaces.MouseListener],
	cards  : [],
	inDeck : [],
	addFull : function (sets) {
		if (arguments.length == 1) {
			(sets * 1).times(function () {
				this.addFull();
			}.bind(this));
			return this;
		}
		var ranks = ['a','k','q','j',10,9,8,7,6,5,4,3,2];
		var suits  = ['s', 'c', 'h', 'd'];
		var deck  = this;

		ranks.each(function (rank) {
			suits.each(function (suit) {
				deck.addCard(new Solitaire.Card(rank, suit));
			});
		});
		return this;
	},
	addCard : function (card) {
		this.cards.include(card);
		this.inDeck.include(card);
		card.deck      = this;
		return this;
	},
	shuffle : function (times) {
		(times || 5).times(function () {
			this.inDeck.shuffle();
		}.bind(this));
		return this;
	},
	getLast : function () {
		return this.inDeck.length ? this.inDeck.shift() : null;
	},
	draw : function () {
		var ctx = this.canvas.ctx;
		ctx.cachedDrawImage({
			image : this.canvas.getImage(
				this.inDeck.length ? 'cardBack' : 'updateDeck'
			),
			draw  : this.getShape()
		});
		return this;
	}
});