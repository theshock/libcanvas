
LibCanvas.Mouse = new Class({
	initialize : function (canvas) {
		this.inCanvas = false;
		this.dot = new LibCanvas.Dot();
		this.x = null;
		this.y = null;
		
		this.canvas = canvas;
		this.elem   = canvas.ctx.canvas;

		this.events = new LibCanvas.Inner.MouseEvents(this);

		this.setEvents();
	},
	setCoords : function (x, y, prev) {
		if (arguments.length == 2) {
			this.x = x;
			this.y = y;
			this.inCanvas = true;
		} else {
			this.x = null;
			this.y = null;
			this.inCanvas = false;
		}
		this.dot.set(this.x, this.y);
		return this;
	},
	expandEvent : function (e) {
		if (!$chk(e.offsetX)) {
			e.offsetX = e.offsetX || e.layerX - e.target.offsetLeft;
			e.offsetY = e.offsetY || e.layerY - e.target.offsetTop;
		}
		return e;
	},
	setEvents : function () {
		var mouse  = this;
		var exp = function (e) {
			return mouse.expandEvent(e.event);
		};
		$(this.canvas.ctx.canvas).addEvents({
			mousemove : function (e) {
				e = exp(e);
				mouse.setCoords(e.offsetX, e.offsetY);
				mouse.events.event('mousemove', e);
				mouse.isOut = false;
			},
			mouseout : function (e) {
				e = exp(e);
				mouse.setCoords(/* null */);
				mouse.events.event('mouseout', e);
				mouse.isOut = true;
			},
			mousedown : function (e) {
				mouse.events.event('mousedown', exp(e));
			},
			mouseup : function (e) {
				mouse.events.event('mouseup'  , exp(e));
			}
		});
		return this;
	},
	subscribe : function (elem) {
		this.events.subscribe(elem);
		return this;
	},
	unsubscribe : function (elem) {
		this.events.unsubscribe(elem);
		return this;
	},
	debug : function () {
		return !this.inCanvas ? 'NotInCanvas' :
			this.x.round(3) + ':' + this.y.round(3);
	}
});