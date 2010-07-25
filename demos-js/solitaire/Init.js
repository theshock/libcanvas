
Solitaire.Init = new Class({
	start : function (libcanvas) {
		this
			.initCanvas(libcanvas)
			.initDeck()
			.initResultContainers()
			.initCells();
		this.canvas.update();
		this.log();
	},
	initCanvas : function (libcanvas) {
		if (!this.canvas) {
			this.canvas = libcanvas;
			libcanvas.addProcessor('pre',
				new LibCanvas.Processors.Clearer(Solitaire.config.canvas.background)
			).start();
			libcanvas.preloadImages    = Solitaire.config.canvas.images;
			libcanvas.progressBarStyle = Solitaire.config.canvas.progressBar;
		}
		return this;
	},
	getCanvas : function () {
		return this.initCanvas().canvas;
	},
	initDeck : function () {
		if (!this.deck) {
			this.deck = new Solitaire
				.FlippableDeck()
				.addFull()
				.shuffle()
				.setShape(Solitaire.createCardShape(Solitaire.config.deckCoords))
				.flipShape(Solitaire.createCardShape(Solitaire.config.flipCoords))
				.listenMouse();
			this.getCanvas().addElement(this.deck);
			this.deck.Solitaire = this;
		}
		return this;
	},
	getDeck : function () {
		return this.initDeck().deck;
	},
	initResultContainers : function () {
		this.containers = [];
		(4).times(function (i) {
			var container = new Solitaire.ResultContainer;
			var coords = Solitaire.config.resultContainersCoords;
			container.setShape(
				Solitaire.createCardShape({
					x : coords.x + i * Solitaire.config.card.shift,
					y : coords.y
				})
			).number = i;
			container.Solitaire = this;
			this.canvas.addElement(container);
			this.containers.push(container);
		}.bind(this));
		return this;
	},
	pushCards : function (cell, count) {
		var deck = this.getDeck();
		while (count--) {
			cell.addCard(deck.getLast(), 'closed');
		}
		cell.addCard(deck.getLast(), 'first');
		return cell;
	},
	initCells : function () {
		this.allCards = [];
		this.cells = [];
		(7).times(function (i) {
			var cell = new Solitaire.Cell;
			cell.number = i;
			cell.setShape(
				Solitaire.config.createCellShape(i)
			).number = i;
			this.canvas.addElement(cell);
			this.cells.push(cell);
		}.bind(this));

		this.cells.each(function (cell, i) {
			this.pushCards(cell, i);
		}.bind(this))
		return this;
	},


	log : function () {
		if (!parseUri().queryKey.debug) {
			return;
		}
		var logAll = function (cards, prefix) {
			var log = '';
			cards.each(function(card) {
				log += prefix + ' ' + card.getName() + '\n';
			}.bind(this));
			return log;
		}.bind(this);

		var conts = [
			this.deck.inDeck,
			this.deck.flipped
		];

		this.cells.each (function (cell, i) {
			conts.push(cell.closed);
			conts.push(cell.cards);
		});
		this.containers.each (function (container, i) {
			conts.push(container.cards);
		});
		var lastData = '';
		(function () {
			var data = '\n\n====== Turn ======\n\n';
			data += 'In Deck:\n';
			data += logAll(this.deck.inDeck, '-');
			data += '-----------------------\n\n';
			data += 'Flipped:\n';
			data += logAll(this.deck.flipped, '=');
			data += '-----------------------\n\n';
			data += 'Cells:\n';
			this.cells.each (function (cell, i) {
				data += '\nCell #' + i + ' :\n';
				data += logAll(cell.closed, '***');
				data += logAll(cell.cards , '==');
			});
			data += '-----------------------\n\n';
			data += 'Containers:\n';
			this.containers.each (function (container, i) {
				data += '\nContainer #' + i + ' :\n';
				data += logAll(container.cards , '==');
			});
			data += '-----------------------\n\n';
			if (data != lastData) {
				$log(data);
				lastData = data;
				conts.each(function (cont1) {
					conts.each(function (cont2) {
						if (cont1 != cont2) {
							cont1.each(function (card1) {
								cont2.each(function (card2) {
									if (card1 == card2) {
										try {
											console.warn('Error: ' + card2.getName());
										}catch(e){};
									}
								});
							});
						}
					});
				});
			}
		}).bind(this).periodical(100);
	}
});