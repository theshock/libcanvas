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

var Drawable = function () {
	
var start = function () {
	this.libcanvas.addElement(this);
	this.events.remove('libcanvasSet', start);
};
var stop = function () {
	this.libcanvas.rmElement(this);
	this.events.remove('libcanvasSet', stop);
};
var manage = function (first, second) {
	return function () {
		this.events.remove('libcanvasSet', first);

		this.libcanvas ?
			second.call( this ) :
			this.events.add('libcanvasSet', second);
		return this;
	}
};

return declare( 'LibCanvas.Behaviors.Drawable', {
	Implements: Class.Events,
	proto: {
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
					this.events.add('libcanvasReady', function () {
						this.libcanvasIsReady = true;
					});
					this.libcanvas.events.add('ready', function () {
						this.events.ready('libcanvasReady')
					}.bind(this));
				}
				this.events.ready('libcanvasSet');
				if (isReady) this.events.ready('libcanvasReady');
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
		startDrawing: manage(stop , start),
		 stopDrawing: manage(start, stop ),

		update : 'abstract',
		draw   : 'abstract'
	}
});

}();