(function () {

var ranks = ['a','k','q','j',10,9,8,7,6,5,4,3,2];
var suits  = ['s', 'c', 'h', 'd'];

var names = {
	ranks : {
		'a' : "Туз",
		'k' : "Король",
		'q' : "Дама",
		'j' : "Валет",
		10  : "Десять",
		 9  : "Девять",
		 8  : "Восемь",
		 7  : "Семь",
		 6  : "Шесть",
		 5  : "Пять",
		 4  : "Четыре",
		 3  : "Три",
		 2  : "Два"
	},
	suits : {
		's' : "пик",
		'c' : "треф",
		'h' : "чирва",
		'd' : "бубна"
	}
};

Solitaire.Card = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	Implements : [
		LibCanvas.Interfaces.MouseListener,
		LibCanvas.Interfaces.Moveable,
		LibCanvas.Interfaces.Draggable,
		LibCanvas.Interfaces.Droppable,
		LibCanvas.Interfaces.Linkable
	],
	rank : null,
	suit : null,
	deck : null,
	container : null,
	hidden : false,
	initialize : function (rank, suit) {
		this.rank = rank;
		this.suit = suit;
	},
	getName : function () {
		return names.ranks[this.rank] + ' ' + names.suits[this.suit];
	},
	getCoords : function () {
		return new LibCanvas.Point(this.getShape().from);
	},
	getImageCrop : function () {
		var tplSize = Solitaire.config.cardTplSize;
		return {
			from : {
				x : (tplSize.width  + tplSize.margin[1]) * ranks.indexOf(this.rank),
				y : (tplSize.height + tplSize.margin[0]) * suits.indexOf(this.suit)
			},
			size : [tplSize.width, tplSize.height]
		};
	},
	sameColor : function (card) {
		var colors = {
			s : 'black', h : 'red',
			c : 'black', d : 'red'
		};
		return colors[this.suit] == colors[card.suit];
	},
	isNextTo : function (card) {
		return card &&
			this.diff(card) == 1 &&
			this.suit == card.suit;
	},
	diff : function (card) {
		var power = ['k','q','j',10,9,8,7,6,5,4,3,2,'a'];
		return power.indexOf(card.rank) - power.indexOf(this.rank);
	},
	draw : function () {
		if (this.hidden) {
			return this;
		}
		this.canvas.ctx.cachedDrawImage({
			image : this.canvas.images['fullDeck'],
			crop  : this.getImageCrop(),
			draw  : this.getShape()
		});
		return this;
	}
});

})();