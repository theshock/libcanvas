/*
---

name: "Ui.Shaper"

description: "Provides base ui object"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.Drawable
	- Behaviors.Animatable
	- Behaviors.Clickable
	- Behaviors.Draggable
	- Behaviors.Droppable
	- Behaviors.Linkable
	- Behaviors.MouseListener
	- Behaviors.Moveable

provides: Ui.Shaper

...
*/

var Shaper = declare( 'LibCanvas.Ui.Shaper', {
	parent: Drawable,

	mixin: [
		Settings.Mixin,
		Animatable,
		Clickable,
		MouseListener,
		Linkable,
		Draggable,
		Droppable,
		Moveable
	],

	proto: {
		active: false,
		hover : false,

		initialize : function (libcanvas, options) {
			this.update = libcanvas.update;

			this.events   = new Events(this);
			this.settings = new Settings(options).addEvents(this.events);
			this.shape    = this.settings.get('shape');

			this.shape.addEvent('move', libcanvas.update);
			this.events.add(['moveDrag', 'statusChanged'], libcanvas.update);
		},
		setOptions : function (options) {
			this.update();
			// todo: bind to events
			return Settings.Mixin.prototype.setOptions.call(this, options);
		},
		getStyle : function (type) {
			var s = this.settings;
			return (this.active && s.get('active')) ? s.get('active')[type] :
				   (this.hover  && s.get('hover'))  ? s.get('hover') [type] :
								  (s.get(type)  || null);
		},

		drawTo : function (ctx) {
			var fill    = this.getStyle('fill'),
				stroke  = this.getStyle('stroke'),
				lineW   = this.getStyle('lineWidth'),
				opacity = this.getStyle('opacity');

			ctx.save();
			if (lineW  ) ctx.set('lineWidth', lineW);
			if (opacity) ctx.set('globalOpacity', opacity);
			if (fill   ) ctx.fill  (this.shape, fill  );
			if (stroke ) ctx.stroke(this.shape, stroke);
			ctx.restore();
			return this;
		},
		draw : function () {
			return this.drawTo(this.libcanvas.ctx);
		},

		// accessors


		get fill () {
			return this.settings.get('fill');
		},
		set fill (value) {
			this.settings.set({ fill: value });
			this.update();
		},

		get stroke () {
			return this.settings.get('stroke');
		},
		set stroke (value) {
			this.settings.set({ stroke: value });
			this.update();
		},

		get lineWidth () {
			return this.settings.get('lineWidth');
		},
		set lineWidth (value) {
			this.settings.set({ lineWidth: value });
			this.update();
		},

		get radius () {
			if (this.shape instanceof Circle) {
				return this.shape.radius;
			} else {
				throw new TypeError('Shape is not circle');
			}
		},
		set radius (value) {
			if (this.shape instanceof Circle) {
			this.shape.radius = value;
			this.update();
			} else {
				throw new TypeError('Shape is not circle');
			}
			if (!Circle.isInstance(this.shape)) {
				throw new TypeError('Shape is not circle');
			}
			this.shape.radius = value;
			this.update();
		},
		dump: function () {
			return '[Shaper ' + this.shape.dump() + ']';
		},
		toString: Function.lambda('[object LibCanvas.Ui.Shaper]')
	}
});