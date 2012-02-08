/*
---

name: "App.Light.Vector"

description: ""

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- App
	- App.Light

provides: App.Light.Vector

...
*/


App.Light.Vector = atom.declare( 'LibCanvas.App.Light.Vector', {
	parent: App.Element,

	prototype: {
		configure: function () {
			var behaviors = this.settings.get('behaviors');

			this.style       = {};
			this.styleActive = {};
			this.styleHover  = {};
			
			this.animate = new atom.Animatable(this).animate;
			this.behaviors = new Behaviors(this);
			this.behaviors.add('Draggable', this.redraw);
			this.behaviors.add('Clickable', this.redraw);
		},

		get mouse () {
			return this.scene.app.resources.get( 'mouse' );
		},

		move: function (point) {
			this.shape.move(point);
			this.redraw();
		},

		setStyle: function (key, values) {
			if (typeof key == 'object') {
				values = key;
				key = '';
			}
			key = 'style' + atom.string.ucfirst(key);

			atom.core.append( this[key], values );
			return this.redraw();
		},

		getStyle: function (type) {
			if (!this.style) return null;

			return (this.active && this.styleActive[type]) ||
			       (this.hover  && this.styleHover [type]) ||
			            this.style[type] || null;
		},

		/**
		 * Override by Animatable method
		 */
		animate: function(){},

		listenMouse: function () {
			return this.scene.app.resources.get('mouseHandler').subscribe(this);
		},

		get currentBoundingShape () {
			var
				br = this.shape.getBoundingRectangle(),
				lw = this.getStyle('stroke') && this.getStyle('lineWidth');

			return lw ? br.fillToPixel().grow(2 * Math.ceil(lw)) : br;
		},

		renderTo: function (ctx) {
			var fill    = this.getStyle('fill'),
			    stroke  = this.getStyle('stroke'),
			    lineW   = this.getStyle('lineWidth'),
			    opacity = this.getStyle('opacity');

			if (opacity === 0) return this;
			
			ctx.save();
			if (opacity) ctx.globalAlpha = atom.number.round(opacity, 3);
			if (fill) ctx.fill(this.shape, fill);
			if (stroke ) {
				if (lineW) ctx.lineWidth = lineW;
				ctx.stroke(this.shape, stroke);
			}
			ctx.restore();
			return this;
		}
	}
});