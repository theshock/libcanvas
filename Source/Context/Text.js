/*
---

name: "Context.Text"

description: "LibCanvas.Context2D adds new canvas context '2d-libcanvas'"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Size
	- Shapes.Rectangle
	- Shapes.Circle

provides: Context.Text

...
*/

new function () {

var toPoint = Point.from, toRectangle = Rectangle.from, size1x1 = new Size(1,1);


/** @class LibCanvas.Context.Text */
LibCanvas.declare( 'LibCanvas.Context.Text', {
	initialize: function (context) {
		this.context = context;
		this.ctx2d   = context.ctx2d;
	},
	// text
	/** @returns {Context2D} */
	method: function (method, text, x, y, maxWidth) {
		var type = typeof x;
		if (type != 'number' && type != 'string') {
			maxWidth = y;
			x = toPoint( x );
			y = x.y;
			x = x.x;
		}
		var args = [text, x, y];
		if (maxWidth) args.push( maxWidth );
		this.ctx2d[method].apply( this.ctx2d, args );
		return this.context;
	},
	fillText : function (text, x, y, maxWidth) {
		return this.method(  'fillText', text, x, y, maxWidth);
	},
	strokeText : function (text, x, y, maxWidth) {
		return this.method('strokeText', text, x, y, maxWidth);
	},
	/** @returns {object} */
	measureText : function (args) {
		return this.ctx2d.measureText.apply(this.ctx2d, args)
	},
	/** @returns {Context2D} */
	text : function (cfg) {
		if (!this.ctx2d.fillText) return this;

		var ctx = this.ctx2d;

		cfg = atom.core.append({
			text   : '',
			color  : null, /* @color */
			wrap   : 'normal', /* no|normal */
			to     : null,
			align  : 'left', /* center|left|right */
			size   : 16,
			weight : 'normal', /* bold|normal */
			style  : 'normal', /* italic|normal */
			family : 'arial,sans-serif', /* @fontFamily */
			lineHeight : null,
			overflow   : 'visible', /* hidden|visible */
			padding : [0,0],
			shadow : null,
			stroke : null,
			lineWidth : null
		}, cfg);

		ctx.save();
		if (typeof cfg.padding == 'number') {
			cfg.padding = [cfg.padding, cfg.padding];
		}
		var method = cfg.stroke ? 'strokeText' : 'fillText';
		var to = cfg.to ? toRectangle(cfg.to) : this.context.rectangle;
		var lh = Math.round(cfg.lineHeight || (cfg.size * 1.15));
		this.context.set('font', atom.string.substitute(
			'{style}{weight}{size}px {family}', {
				style  : cfg.style == 'italic' ? 'italic ' : '',
				weight : cfg.weight == 'bold'  ? 'bold '   : '',
				size   : cfg.size,
				family : cfg.family
			})
		);

		if (cfg.color) {
			this.context.set(cfg.stroke ? 'strokeStyle' : 'fillStyle', cfg.color);
		}

		if (cfg.shadow) this.context.shadow = cfg.shadow;
		if (cfg.overflow == 'hidden') this.context.clip(to);
		if (cfg.lineWidth) this.context.set({ lineWidth: cfg.lineWidth });

		function xGet (lineWidth) {
			var al = cfg.align, pad = cfg.padding[1];
			return Math.round(
				al == 'left'  ? to.from.x + pad :
				al == 'right' ? to.to.x - lineWidth - pad :
					to.from.x + (to.width - lineWidth)/2
			);
		}
		function measure (text) {
			return Number(ctx.measureText(text).width);
		}
		var lines = String(cfg.text).split('\n');

		if (cfg.wrap == 'no') {
			lines.forEach(function (line, i) {
				if (!line) return;

				ctx[method](line, xGet(cfg.align == 'left' ? 0 : measure(line)), to.from.y + (i+1)*lh);
			});
		} else {
			var lNum = 0;
			lines.forEach(function (line) {
				if (!line) {
					lNum++;
					return;
				}

				var words = (line || ' ').match(/.+?(\s|$)/g);
				if (!words) {
					lNum++;
					return;
				}
				var L  = '';
				var Lw = 0;
				for (var i = 0; i <= words.length; i++) {
					var last = i == words.length;
					if (!last) {
						var text = words[i];
						// @todo too slow. 2-4ms for 50words
						var wordWidth = measure(text);
						if (!Lw || Lw + wordWidth < to.width) {
							Lw += wordWidth;
							L  += text;
							continue;
						}
					}
					if (Lw) {
						ctx[method](L, xGet(Lw), to.from.y + (++lNum)*lh + cfg.padding[0]);
						if (last) {
							L  = '';
							Lw = 0;
						} else {
							L  = text;
							Lw = wordWidth;
						}
					}
				}
				if (Lw) {
					ctx[method](L, xGet(Lw), to.from.y + (++lNum)*lh + cfg.padding[0]);
				}
			});

		}
		ctx.restore();
		return this.context;
	}

});

};
