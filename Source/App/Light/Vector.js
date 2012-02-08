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
			if (this.settings.get('mouse') !== false) {
				this.listenMouse();
			}
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

			var
				active = (this.active || null) && this.styleActive[type],
				hover  = (this.hover || null)  && this.styleHover [type],
				plain  = this.style[type];

			return active != null ? active :
			       hover  != null ? hover  :
			       plain  != null ? plain  : null;
		},

		/**
		 * Override by Animatable method
		 */
		animate: function(){},

		listenMouse: function (unsubscribe) {
			var method = unsubscribe ? 'unsubscribe' : 'subscribe';
			return this.scene.app.resources.get('mouseHandler')[method](this);
		},

		destroy: function () {
			this.listenMouse(true);
			return App.Element.prototype.destroy.call(this);
		},

		get currentBoundingShape () {
			var
				br = this.shape.getBoundingRectangle(),
				lw = this.getStyle('stroke') && (this.getStyle('lineWidth') || 1);

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
				ctx.lineWidth = lineW || 1;
				ctx.stroke(this.shape, stroke);
			}
			ctx.restore();
			return this;
		}
	}
});