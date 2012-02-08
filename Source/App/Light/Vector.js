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
			var
				behaviors = this.settings.get('behaviors'),
				i = behaviors && behaviors.length;

			this.animate = new atom.Animatable(this).animate;
			this.behaviors = new Behaviors(this);
			while (i--) this.behaviors.add(behaviors[i], this.redraw);
		},

		get mouse () {
			return this.scene.app.resources.get( 'mouse' );
		},

		move: function (point) {
			this.shape.move(point);
			this.redraw();
		},

		getStyle: function (type) {
			var s = this.settings;
			return (this.active && s.get('active') && s.get('active')[type]) ||
			       (this.hover  && s.get('hover')) && s.get('hover') [type]  ||
								  s.get(type)  || null;
		},

		/**
		 * Override by Animatable method
		 */
		animate: function(){},

		listenMouse: function () {
			return this.scene.app.resources.get('mouseHandler').subscribe(this);
		},

		renderTo: function (ctx) {
			var fill    = this.getStyle('fill'),
			    stroke  = this.getStyle('stroke'),
			    lineW   = this.getStyle('lineWidth'),
			    opacity = this.getStyle('opacity');

			ctx.save();
			if (lineW  ) ctx.lineWidth   = lineW;
			if (opacity) ctx.globalAlpha = opacity;
			if (fill   ) ctx.fill  (this.shape, fill  );
			if (stroke ) ctx.stroke(this.shape, stroke);
			ctx.restore();
			return this;
		}
	}
});