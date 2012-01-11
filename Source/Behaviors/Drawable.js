/*
---

name: "Behaviors.Drawable"

description: "Abstract class for drawable canvas objects"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Behaviors.Drawable

...
*/

var Drawable = LibCanvas.Behaviors.Drawable = function () {
	
var start = function () {
	this.libcanvas.addElement(this);
	// todo: dont use removeEvent
	return 'removeEvent';
};
var stop = function () {
	this.libcanvas.rmElement(this);
	// todo: dont use removeEvent
	return 'removeEvent';
};

return Class({
	Implements: Class.Events,
	libcanvasIsReady: false,
	setLibcanvas : function (libcanvas) {
		if (this.libcanvas) {
			this.libcanvas.rmElement(this);
			this.libcanvas = libcanvas;
		} else {
			this.libcanvas = libcanvas;
			var isReady = this.libcanvas.isReady();
			if (isReady) {
				this.libcanvasIsReady = true;
			} else {
				this.addEvent('libcanvasReady', function () {
					this.libcanvasIsReady = true;
				});
				this.libcanvas.addEvent('ready', this.readyEvent.bind(this, 'libcanvasReady'));
			}
			this.readyEvent('libcanvasSet');
			if (isReady) this.readyEvent('libcanvasReady');
		}
		return this;
	},
	isReady : function () {
		return this.libcanvasIsReady;
	},
	// @deprecated
	getShape : function () {
		return this.shape;
	},
	// @deprecated
	setShape : function (shape) {
		this.shape = shape;
		return this;
	},
	// @deprecated
	getZIndex : function () {
		return this.zIndex || 0;
	},
	hasPoint: function (point) {
		return this.shape.hasPoint( point );
	},
	// @deprecated
	setZIndex : function (zIndex) {
		this.zIndex = zIndex;
		return this;
	},
	toLayer: function (name) {
		if (this.libcanvas) {
			this.libcanvas
				.rmElement(this)
				.layer(name)
				.addElement(this);
		}
		return this;
	},
	startDrawing: function () {
		this.removeEvent('libcanvasSet', stop);

		this.libcanvas ?
			start.call( this ) :
			this.addEvent('libcanvasSet', start);
		return this;
	},
	stopDrawing: function () {
		this.removeEvent('libcanvasSet', start);

		this.libcanvas ?
			stop.call( this ) :
			this.addEvent('libcanvasSet', stop);
		return this;
	},
	update : Class.abstractMethod,
	draw   : Class.abstractMethod
});

}();