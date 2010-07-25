Solitaire.Cell = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	closed : [],
	cards : [],
	funcs : {},
	initialize : function () {
		// Initialize utility functions for pulling (bring to front) and
		// pushing (bring backwards respectively) cards.
		this.funcs = this.getZIndexFuncs(new Hash({ "pull" : 50, "push" : 1 }));
	},
	/**
	 * Returns count of closed and opened cards at this cell.
	 * @return int
	 */
	countCards : function () {
		return this.closed.length + this.cards.length;
	},
	/**
	 * Add the card to cell
	 */
	addCard : function (card, type) {
		if (type == 'closed') {
			this.closed.push(card);
			return true;
		} else if (this.canPush(card) || type == 'first') {
            this.addOpenCard(card, type);
			return true;
		}
		return false;
	},
	addOpenCard : function (card, type) {
		var shape = this.createCardShape(this.countCards());
		if (type != 'linked') {
			type != 'first' ? card.moveTo(shape) :
				this.initFirst(card, shape);
		}

		this.addEvents(card);
		if (this.current() && type != 'linked') {
			this.current().link(card);
		}
		this.cards.push(card);
	},
	initFirst : function (card, shape) {
		return card.deck.initDrop(
			card.setCanvas(this.canvas)
				.setShape(shape.bind('moved', function () {
					card.canvas.update();
				}))
				.listenMouse()
				.draggable()
		);
	},
	getZIndexFuncs : function (deltas) {
		var funcs = {};
		deltas.each(function (item, i) {
			funcs[i] = function () {
				this.setZIndex(item);
			}.bind(this);
		}, this);
		return funcs;
	},
	bindDrag : function (card, unbind) {
		var method = unbind ? 'unbind' : 'bind';
		return card
			[method]('startDrag', this.funcs['pull'])
			[method]('stopMove', this.funcs['push']);
	},
	unlinkCard : function (card) {
		var prev = this.prevTo(card);
		if (prev) {
			prev.unlink(card);
		}
		return this;
	},
	removeCard : function (card, byLink) {
		if (!byLink) {
			this.unlinkCard(card);
		}
		this.bindDrag(card, true);
		this.cards.erase(card);
		return this;
	},
	/**
	 * Opens top closed card
	 */
	openClosedCard : function () {
		if (!this.cards.length && this.closed.length) {
			this.addCard(this.closed.pop(), 'first');
		}
	},
	isValidDrop : function (card, to, byLink) {
		return (to && to != this && to.addCard && to.addCard(card, byLink ? 'linked' : ''));
	},
	/**
	 * Add events to card (such as when one is dragged'n'dropped).
	 * @param Card card
	 */
	addEvents : function (card) {
		return this.bindDrag(card).unbind('dropped')
			.bind('dropped', function (to, byLink) {
				if (!this.isValidDrop(card, to, byLink)) {
					card.returnToStart(Solitaire.config.card.speed);
					return null;
				}
				this.funcs['push'](); // Bring card backwards
				var next = this.nextTo(card);
				this.removeCard(card, byLink); 
				if (next) {
					next.bind('dropped', [to, true]);
				}
				this.openClosedCard();
				return 'unbind';
			}.bind(this));
	},
	canPush : function (card) {
		return (
				!this.current() && card.rank == 'k'
			) || (
				this.current()
					&&
				this.current().diff(card) == 1
					&&
				!card.sameColor(this.current())
			);
	},
	shiftTo : function (card, shift) {
		var index = this.cards.indexOf(card);
		if (index == -1) {
			return null;
		}
		return this.cards[index + shift] || null;
	},
	nextTo : function (card) {
		return this.shiftTo(card, 1);
	},
	prevTo : function (card) {
		return this.shiftTo(card, -1);
	},
	current : function () {
		var L = this.cards.length;
		return L ? this.cards[L-1] : null;
	},
	createCardShape : function (num, closed, fromZero) {
		var cfg = Solitaire.config;
		var shape = this.getShape();
		var shift = this.getShift(num);
		return new LibCanvas.Shapes.Rectangle({
			from : {
				x : (fromZero ? 0 : shape.start.x) + shift.h,
				y : (fromZero ? 0 : shape.start.y) + shift.v
			},
			size : {
				w : cfg.card.width,
				h : cfg.card.height
			}
		});
	},
	getShift : function (num) {
		var shiftV, closedV, shiftH, closedH;
		var cfg = Solitaire.config;
		shiftV = closedV = cfg.cell.shift.v;
		shiftH = closedH = cfg.cell.shift.h;
		if (cfg.cell.closed) {
			closedV *= cfg.cell.closed;
			closedH *= cfg.cell.closed;
		}

		var cl = this.closed.length;
		if (num < cl) {
			return {
				v : closedV * num,
				h : closedH * num
			}
		} else {
			return {
				v : closedV * cl + shiftV * (num - cl),
				h : closedH * cl + shiftH * (num - cl)
			}
		}
	},
	draw : function () {
		this.drawClosedCards();

		// Drawing all other opened cards
		this.cards.each(function (card, i) {
			card.setZIndex(i).draw();
		});
		return this;
	},
	getClosedCache : function (cardsCount) {
		var CD = Solitaire.Cache.ClosedDraw;
		if (!CD[cardsCount]) {
			var last  = this.createCardShape(6, true, true); // max
			var cache = LibCanvas.Buffer(
				last.from.x + last.width,
				last.from.y + last.height
			);
			cardsCount.times(function (i) {
				cache.getContext('2d-libcanvas').cachedDrawImage({
					image : this.canvas.getImage('cardBack'),
					draw  : this.createCardShape(i, true, true)
				});
			}.bind(this));
			CD[cardsCount] = cache;
		}
		return CD[cardsCount];
	},
	drawClosedCards : function () {
		// Setting stroke for closed cards
		var shape = this.createCardShape(0, true);
		this.canvas.ctx
			.stroke(this.getShape(), '#265226')
			.drawImage({
				image : this.getClosedCache(this.closed.length),
				from  : [shape.from.x, shape.from.y]
			});
	}
});