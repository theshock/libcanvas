/*
---

name: "Context2D"

description: "LibCanvas.Context2D adds new canvas context '2d-libcanvas'"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shapes.Rectangle
	- Shapes.Circle
	- Utils.Canvas

provides: Context2D

...
*/

var Context2D = LibCanvas.Context2D = function () {

var office = {
	all : function (type, style) {
		this.save();
		if (style) this.set(type + 'Style', style);
		this[type + 'Rect'](this.getFullRectangle());
		this.restore();
		return this;
	},
	rect : function (func, args) {
		var rect = office.makeRect.call(this, args);
		return this.original(func,
			[rect.from.x, rect.from.y, rect.width, rect.height]);
	},
	makeRect: function (args) {
		return args.length ? Rectangle(args) : this.rectangle;
	},
	fillStroke : function (type, args) {
		if (args.length >= 1 && args[0] instanceof Shape) {
			if (args[1]) this.save().set(type + 'Style', args[1]);
			args[0].draw(this, type);
			if (args[1]) this.restore();
		} else {
			if (args.length && args[0]) this.save().set(type + 'Style', args[0]);
			this.original(type);
			if (args.length && args[0]) this.restore();
		}
		
		return this;
	},
	originalPoint : function (func, args) {
		var point = Point(args);
		return this.original(func, [point.x, point.y]);
	}
};

var accessors = {};
[ 'fillStyle','font','globalAlpha','globalCompositeOperation','lineCap',
  'lineJoin','lineWidth','miterLimit','shadowOffsetX','shadowOffsetY',
  'shadowBlur','shadowColor','strokeStyle','textAlign','textBaseline'
].forEach(function (property) {
	atom.accessors.define(accessors, property, {
		set: function (value) {
			try {
				this.ctx2d[property] = value;
			} catch (e) {
				throw TypeError('Exception while setting «' + property + '» to «' + value + '»: ' + e.message);
			}
		},
		get: function () {
			return this.ctx2d[property];
		}
	})
});

var constants =
/** @lends LibCanvas.Context2D */
{
	COMPOSITE: {
		SOURCE_OVER: 'source-over',
		SOURCE_IN  : 'source-in',
		SOURCE_OUT : 'source-out',
		SOURCE_ATOP: 'source-atop',

		DESTINATION_OVER: 'destination-over',
		DESTINATION_IN  : 'destination-in',
		DESTINATION_OUT : 'destination-out',
		DESTINATION_ATOP: 'destination-atop',

		LIGHTER: 'lighter',
		DARKER : 'darker',
		COPY   : 'copy',
		XOR    : 'xor'
	},

	LINE_CAP: {
		BUTT  : 'butt',
		ROUND : 'round',
		SQUARE: 'square'
	},

	LINE_JOIN: {
		ROUND: 'round',
		BEVEL: 'bevel',
		MITER: 'miter'
	},

	TEXT_ALIGN: {
		LEFT  : 'left',
		RIGHT : 'right',
		CENTER: 'center',
		START : 'start',
		END   : 'end'
	},

	TEXT_BASELINE: {
		TOP        : 'top',
		HANGING    : 'hanging',
		MIDDLE     : 'middle',
		ALPHABETIC : 'alphabetic',
		IDEOGRAPHIC: 'ideographic',
		BOTTOM     : 'bottom'
	}

};

var Context2D = Class(
/**
 * @lends LibCanvas.Context2D.prototype
 * @property {string} fillStyle
 * @property {string} font
 * @property {number} globalAlpha
 * @property {string} globalCompositeOperation
 * @property {string} lineCap
 * @property {string} lineJoin
 * @property {number} lineWidth
 * @property {number} miterLimit
 * @property {number} shadowOffsetX
 * @property {number} shadowOffsetY
 * @property {number} shadowBlur
 * @property {string} shadowColor
 * @property {string} strokeStyle
 * @property {string} textAlign
 * @property {string} textBaseline
 */
{
	Static: constants,

	Implements: Class(accessors),

	initialize : function (canvas) {
		if (canvas instanceof CanvasRenderingContext2D) {
			this.ctx2d  = canvas;
			this.canvas = this.ctx2d.canvas;
		} else {
			this.canvas = canvas;
			this.ctx2d  = canvas.getOriginalContext('2d');
		}
	},
	get width () { return this.canvas.width; },
	get height() { return this.canvas.height; },
	set width (width)  { this.canvas.width  = width; },
	set height(height) { this.canvas.height = height;},
				 
	get shadow () {
		return [this.shadowOffsetX, this.shadowOffsetY, this.shadowBlur, this.shadowColor].join( ' ' );
	},
	
	set shadow (value) {
		value = value.split( ' ' );
		this.shadowOffsetX = value[0];
		this.shadowOffsetY = value[1];
		this.shadowBlur    = value[2];
		this.shadowColor   = value[3];
	},
	
	_rectangle: null,
	/** @returns {Rectangle} */
	get rectangle () {
		var rect = this._rectangle;
		if (!rect) {
			this._rectangle = rect = new Rectangle(0, 0, this.width, this.height)
		} else {
			rect.size = this;
		}
		return rect;
	},
	/** @deprecated */
	getFullRectangle : function () {
		return this.rectangle;
	},
	/** @returns {Context2D} */
	original : function (method, args, returnResult) {
		try {
			var result = this.ctx2d[method].apply(this.ctx2d, args || []);
			if (returnResult) return result;
		} catch (e) {
			console.log('Error in context2d.original(', method, ',', (args || []), ')');
			throw e;
		}
		return this;
	},
	/** @returns {HTMLCanvasElement} */
	getClone : function (width, height) {
		var resize = !!(width || height), canvas = this.canvas;
		width  = width  || canvas.width;
		height = height || canvas.height;

		var args = [canvas, 0, 0];
		if (resize) args.push(width, height);

		var clone = Buffer(width, height, true);
		clone.ctx.original('drawImage', args);
		return clone;
	},

	// Values
	/** @returns {Context2D} */
	set : function (name, value) {
		if (typeof name == 'object') {
			for (var i in name) this[i] = name[i];
		} else this[name] = value;
		return this;
	},
	/** @returns {string} */
	get : function (name) {
		return this[name];
	},

	// All
	/** @returns {Context2D} */
	fillAll : function (style) {
		return office.all.call(this, 'fill', style);
	},
	/** @returns {Context2D} */
	strokeAll : function (style) {
		return office.all.call(this, 'stroke', style);
	},
	/** @returns {Context2D} */
	clearAll : function (style) {
		return office.all.call(this, 'clear', style);
	},

	// Save/Restore
	/** @returns {Context2D} */
	save : function () {
		return this.original('save');
	},
	/** @returns {Context2D} */
	restore : function () {
		return this.original('restore');
	},

	// Fill/Stroke
	/** @returns {Context2D} */
	fill : function (shape) {
		return office.fillStroke.call(this, 'fill', arguments);
	},
	/** @returns {Context2D} */
	stroke : function (shape) {
		return office.fillStroke.call(this, 'stroke', arguments);
	},
	/** @returns {Context2D} */
	clear: function (shape) {
		return shape instanceof Shape && shape.self != Rectangle ?
			this
				.save()
				.set({ globalCompositeOperation: Context2D.COMPOSITE.DESTINATION_OUT })
				.fill( shape )
				.restore() :
			this.clearRect( Rectangle(arguments) );
	},

	// Path
	/** @returns {Context2D} */
	beginPath : function (moveTo) {
		var ret = this.original('beginPath');
		arguments.length && this.moveTo.apply(this, arguments);
		return ret;
	},
	/** @returns {Context2D} */
	closePath : function () {
		arguments.length && this.lineTo.apply(this, arguments);
		return this.original('closePath');
	},
	/** @returns {Context2D} */
	moveTo : function (point) {
		return office.originalPoint.call(this, 'moveTo', arguments);
	},
	/** @returns {Context2D} */
	lineTo : function (point) {
		return office.originalPoint.call(this, 'lineTo', arguments);
	},

	/** @returns {Context2D} */
	arc : function (x, y, r, startAngle, endAngle, anticlockwise) {
		var a = Array.pickFrom(arguments), circle, angle, acw;
		if (a.length > 1) {
			return this.original('arc', a);
		} else if ('circle' in a[0]) {
			circle = Circle(a[0].circle);
			angle  = Array.isArray(a[0].angle) ?
				a[0].angle.associate(['start', 'end']) :
				Object.collect(a[0].angle, ['start', 'end', 'size']);
			if (Array.isArray(angle)) {
				angle = angle.associate(['start', 'end']);
			} else if (angle.size != null) {
				if ('end' in angle) {
					angle.end = angle.size + angle.start;
				} else if ('start' in angle) {
					angle.start = angle.end - angle.size;
				}
			}
			acw = !!(a[0].anticlockwise || a[0].acw);
		} else {
			throw new TypeError('Wrong arguments in CanvasContext.arc');
		}
		return this.original('arc', [
			circle.center.x, circle.center.y, circle.radius, angle.start, angle.end, acw
		]);
	},

	/** @returns {Context2D} */
	arcTo : function () {
		// @todo Beauty arguments
		return this.original('arcTo', arguments);
	},
	/** @returns {Context2D} */
	curveTo: function (curve) {
		var p, l, to;

		if (typeof curve == 'number') {
			if (arguments.length === 4) {
				return this.original('quadraticCurveTo', arguments);
			} else if (arguments.length === 6) {
				return this.original('bezierCurveTo', arguments);
			}
		} else if (arguments.length > 1) {
			p  = Array.from( arguments ).map(Point);
			to = p.shift()
		} else {
			p  = Array.from( curve.points ).map(Point);
			to = Point(curve.to);
		}

		l = p.length;

		if (l == 2) {
			this.original('bezierCurveTo', [
				p[0].x, p[0].y, p[1].x, p[1].y, to.x, to.y
			]);
		} else if (l == 1) {
			this.original('quadraticCurveTo', [
				p[0].x, p[0].y, to.x, to.y
			]);
		} else {
			this.original('lineTo', [to]);
		}
		return this;
	},
	/** @returns {Context2D} */
	quadraticCurveTo : function () {
		var a = arguments;
		if (a.length == 4) {
			return this.original('bezierCurveTo', arguments);
		} else {
			a = a.length == 2 ? a.associate(['p', 'to']) : a[0];
			return this.curveTo({
				to: a.to,
				points: [a.p]
			});
		}
	},
	/** @returns {Context2D} */
	bezierCurveTo : function () {
		var a = arguments;
		if (a.length == 6) {
			return this.original('bezierCurveTo', arguments);
		} else {
			a = a.length == 3 ? {p1:a[0], p2:a[1], to:a[2]} : a[0];
			return this.curveTo({
				to: a.to,
				points: [a.p1, a.p2]
			});
		}
	},
	/** @returns {boolean} */
	isPointInPath : function (x, y) {
		var point = Point(arguments);
		return this.original('isPointInPath', [point.x, point.y], true);
	},
	/** @returns {Context2D} */
	clip : function (shape) {
		if (shape && typeof shape.processPath == 'function') {
			shape.processPath(this);
		}
		return this.original('clip');
	},

	// transformation
	/** @returns {Context2D} */
	rotate : function (angle, pivot) {
		if (angle) {
			if (pivot) this.translate(pivot);
			this.original('rotate', [angle]);
			if (pivot) this.translate(pivot, true);
		}
		return this;
	},
	/** @returns {Context2D} */
	translate : function (point, reverse) {
		point = Point(
			(arguments.length === 1 || typeof reverse === 'boolean')
				? point : arguments
		);
		var multi = reverse === true ? -1 : 1;
		this.original('translate', [point.x * multi, point.y * multi]);
		return this;
	},
	/** @returns {Context2D} */
	scale : function (power, pivot) {
		if (typeof pivot == 'number') {
			power = new Point(power, pivot);
			pivot = null;
		} else {
			power = Point(power);
		}
		if (power.x != 1 || power.y != 1) {
			if (pivot) this.translate(pivot);
			this.original('scale', [power.x, power.y]);
			if (pivot) this.translate(pivot, true);
		}
		return this;
	},
	/** @returns {Context2D} */
	transform : function () {
		// @todo Beauty arguments
		return this.original('transform', arguments);
	},
	/** @returns {Context2D} */
	setTransform : function () {
		// @todo Beauty arguments
		return this.original('setTransform', arguments);
	},

	// Rectangle
	/** @returns {Context2D} */
	fillRect : function (rectangle) {
		return office.rect.call(this, 'fillRect', arguments);
	},
	/** @returns {Context2D} */
	strokeRect : function (rectangle) {
		return office.rect.call(this, 'strokeRect', arguments);
	},
	/** @returns {Context2D} */
	clearRect : function (rectangle) {
		return office.rect.call(this, 'clearRect', arguments);
	},

	// text
	/** @returns {Context2D} */
	fillText : function (text, x, y, maxWidth) {
		var type = typeof x;
		if (type != 'number' && type != 'string') {
			maxWidth = y;
			x = Point( x );
			y = x.y;
			x = x.x;
		}
		var args = [text, x, y];
		if (maxWidth) args.push( maxWidth );
		return this.original('fillText', args);
	},
	/** @returns {Context2D} */
	strokeText : function (text, x, y, maxWidth) {
		var type = typeof x;
		if (type != 'number' && type != 'string') {
			maxWidth = y;
			x = Point( x );
			y = x.y;
			x = x.x;
		}
		var args = [text, x, y];
		if (maxWidth) args.push( maxWidth );
		return this.original('strokeText', args);
	},
	/** @returns {object} */
	measureText : function (textToMeasure) {
		return this.original('measureText', arguments, true);
	},
	/** @returns {Context2D} */
	text : function (cfg) {
		if (!this.ctx2d.fillText) return this;
		
		cfg = atom.append({
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
			shadow : null
		}, cfg);
		
		this.save();
		if (atom.typeOf(cfg.padding) == 'number') {
			cfg.padding = [cfg.padding, cfg.padding];
		}
		var to = cfg.to ? Rectangle(cfg.to) : this.rectangle;
		var lh = (cfg.lineHeight || (cfg.size * 1.15)).round();
		this.set('font', '{style}{weight}{size}px {family}'
			.substitute({
				style  : cfg.style == 'italic' ? 'italic ' : '',
				weight : cfg.weight == 'bold'  ? 'bold '   : '',
				size   : cfg.size,
				family : cfg.family
			})
		);
		if (cfg.shadow) this.shadow = cfg.shadow;
		if (cfg.color) this.set({ fillStyle: cfg.color });
		if (cfg.overflow == 'hidden') this.clip(to);
		
		var xGet = function (lineWidth) {
			var al = cfg.align, pad = cfg.padding[1];
			return Math.round(
				al == 'left'  ? to.from.x + pad :
				al == 'right' ? to.to.x - lineWidth - pad :
					to.from.x + (to.width - lineWidth)/2
			);
		};
		var lines = String(cfg.text).split('\n');
		
		var measure = function (text) { return Number(this.measureText(text).width); }.bind(this);
		if (cfg.wrap == 'no') {
			lines.forEach(function (line, i) {
				if (!line) return;
				
				this.fillText(line, xGet(cfg.align == 'left' ? 0 : measure(line)), to.from.y + (i+1)*lh);
			}.bind(this));
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
						this.fillText(L, xGet(Lw), to.from.y + (++lNum)*lh + cfg.padding[0]);
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
					this.fillText(L, xGet(Lw), to.from.y + (++lNum)*lh + cfg.padding[0]);
					L  = '';
					Lw = 0;
				}
			}.bind(this));
			
		}
		return this.restore();
	},

	// image
	/** @returns {Context2D} */
	drawImage : function (a) {
		if (arguments.length > 2) return this.original('drawImage', arguments);
		if (arguments.length == 2) {
			a = { image: a, draw: arguments[1] };
		} else if (atom.typeOf(a) == 'element') {
			return this.original('drawImage', [a, 0, 0]);
		}

		if (!a.image) throw new TypeError('No image');
		var center, from = a.center || a.from;

		var scale = a.scale ? Point(a.scale) : null;

		var transform = function (a, center) {
			if (a.angle) this.rotate(a.angle, center);
			if (scale  ) this.scale( scale, center );
		}.bind(this);

		var needTransform = a.angle || (scale && (scale.x != 1 || scale.y != 1));

		this.save();
		if (from) {
			from = Point(from);
			if (a.center) from = {
				x : from.x - a.image.width/2,
				y : from.y - a.image.height/2
			};
			if (needTransform) {
				center = a.center || {
					x : from.x + a.image.width/2,
					y : from.y + a.image.height/2
				};
				transform(a, center);
			} else if (a.optimize) {
				from = { x: from.x.round(), y: from.y.round() }
			}
			this.original('drawImage', [
				a.image, from.x, from.y
			]);
		} else if (a.draw) {
			var draw = Rectangle(a.draw);
			if (needTransform) transform(a, draw.center);

			if (a.crop) {
				var crop = Rectangle(a.crop);
				this.original('drawImage', [
					a.image,
					crop.from.x, crop.from.y, crop.width, crop.height,
					draw.from.x, draw.from.y, draw.width, draw.height
				]);
			} else if (a.optimize) {
				var size = draw.size, dSize = {
					x: (size.width  - a.image.width ).abs(),
					y: (size.height - a.image.height).abs()
				};
				from = { x: draw.from.x.round(), y: draw.from.y.round() };
				if (dSize.x <= 1.1 && dSize.y <= 1.1 ) {
					this.original('drawImage', [ a.image, from.x, from.y ]);
				} else {
					this.original('drawImage', [
						a.image, from.x, from.y, size.width.round(), size.height.round()
					]);
				}
			} else {
				this.original('drawImage', [
					a.image, draw.from.x, draw.from.y, draw.width, draw.height
				]);
			}
		} else {
			throw new TypeError('Wrong Args in Context.drawImage');
		}
		return this.restore();
	},

	/** @returns {Context2D} */
	projectiveImage : function (arg) {
		// test
		new ProjectiveTexture(arg.image)
			.setContext(this.ctx2d)
			.setQuality(arg.patchSize, arg.limit)
			.render( arg.to );
		return this;
	},

	// image data
	/** @returns {CanvasPixelArray} */
	createImageData : function () {
		var w, h;

		var args = Array.pickFrom(arguments);
		switch (args.length) {
			case 0:{
				w = this.canvas.width;
				h = this.canvas.height;
			} break;

			case 1: {
				var obj = args[0];
				if (atom.typeOf(obj) == 'object' && ('width' in obj) && ('height' in obj)) {
					w = obj.width;
					h = obj.height;
				}
				else {
					throw new TypeError('Wrong argument in the Context.createImageData');
				}
			} break;

			case 2: {
				w = args[0];
				h = args[1];
			} break;

			default: throw new TypeError('Wrong args number in the Context.createImageData');
		}

		return this.original('createImageData', [w, h], true);
	},

	/** @returns {Context2D} */
	putImageData : function () {
		var a = arguments, put = {}, args, rect;

		switch (a.length) {
			case 1: {
				if (!typeof a == 'object') {
					throw new TypeError('Wrong argument in the Context.putImageData');
				}

				a = a[0];
				put.image = a.image;
				put.from = Point(a.from);

				if (a.crop) put.crop = Rectangle(a.crop);
			} break;

			case 3: {
				put.image = a[0];
				put.from = Point([a[1], a[2]]);
			} break;

			case 7: {
				put.image = a[0];
				put.from = new Point(a[1], a[2]);
				put.crop = new Rectangle(a[3], a[4], a[5], a[6]);
			} break;

			default : throw new TypeError('Wrong args number in the Context.putImageData');
		}

		args = [put.image, put.from.x, put.from.y];

		if (put.crop) {
			rect = put.crop;
			args.append([rect.from.x, rect.from.y, rect.width, rect.height])
		}

		return this.original('putImageData', args);
	},
	/** @returns {CanvasPixelArray} */
	getImageData : function (rectangle) {
		var rect = office.makeRect.call(this, arguments);

		return this.original('getImageData', [rect.from.x, rect.from.y, rect.width, rect.height], true);
	},
	getPixels : function (rectangle) {
		var rect = Rectangle(arguments),
			data = this.getImageData(rect).data,
			result = [],
			line = [];
		for (var i = 0, L = data.length; i < L; i+=4)  {
			line.push({
				r : data[i],
				g : data[i+1],
				b : data[i+2],
				a : data[i+3] / 255
			});
			if (line.length == rect.width) {
				result.push(line);
				line = [];
			}
		}
		return result;
	},
	getPixel: function (point) {
		point = Point( arguments );
		var data = this.getImageData(new Rectangle({ from: point, size: [1,1] })).data;

		return {
			r: data[0],
			g: data[1],
			b: data[2],
			a: data[3] / 255
		};
	},


	/** @returns {CanvasGradient} */
	createGradient: function (from, to, colors) {
		var gradient;
		if ( from instanceof Rectangle ) {
			colors   = to;
			gradient = this.createLinearGradient( from );
		} else if (from instanceof Circle) {
			gradient = this.createRadialGradient( from, to );
		} else if (from instanceof Point) {
			gradient = this.createLinearGradient( from, to, colors );
		} else {
			throw new Error('Unknown arguments');
		}
		if (typeof colors == 'object') gradient.addColorStop( colors );
		return gradient;
	},
	/** @returns {CanvasGradient} */
	createRectangleGradient: function (rectangle, colors) {
		rectangle = Rectangle( rectangle );

		var from = rectangle.from, line = new Line( rectangle.bottomLeft, rectangle.topRight );

		return this.createGradient( from, line.perpendicular(from).scale(2, from), colors );
	},
	/** @returns {CanvasGradient} */
	createLinearGradient : function (from, to) {
		var a = arguments;
		if (a.length != 4) {
			if (a.length == 2) {
				to   = Point(to);
				from = Point(from);
			} else if (a.length == 1) {
				// wee
				to   = Point(a[0].to);
				from = Point(a[0].from);
			}
			a = [from.x, from.y, to.x, to.y];
		}
		return fixGradient( this.original('createLinearGradient', a, true) );
	},
	/** @returns {CanvasGradient} */
	createRadialGradient: function () {
		var points, c1, c2, a = arguments;
		if (a.length == 1 || a.length == 2) {
			if (a.length == 2) {
				c1 = Circle( a[0] );
				c2 = Circle( a[1] );
			} else {
				c1 = Circle( a.start );
				c2 = Circle( a.end   );
			}
			points = [c1.center.x, c1.center.y, c1.radius, c2.center.x, c2.center.y, c2.radius];
		} else if (a.length == 6) {
			points = a;
		} else {
			throw new TypeError('Wrong args number in the Context.createRadialGradient');
		}

		return fixGradient( this.original('createRadialGradient', points, true) );
	},

	/** @returns {CanvasPattern} */
	createPattern : function () {
		return this.original('createPattern', arguments, true);
	},
	/** @returns {CanvasGradient} */
	drawWindow : function () {
		return this.original('drawWindow', arguments);
	},
	/** @returns {string} */
	toString: Function.lambda('[object LibCanvas.Context2D]')
	// Such moz* methods wasn't duplicated:
	// mozTextStyle, mozDrawText, mozMeasureText, mozPathText, mozTextAlongPath
});

var addColorStop = function () {
	var orig = document
		.createElement('canvas')
		.getContext('2d')
		.createLinearGradient(0,0,1,1)
		.addColorStop;
		
	return function (colors) {
		if (typeof colors == 'object') {
			for (var position in colors) {
				orig.call( this, parseFloat(position), colors[position] );
			}
		} else {
			orig.apply( this, arguments );
		}
		return this;
	};
}();


var fixGradient = function (grad) {
	grad.addColorStop = addColorStop;
	return grad;
};

Context2D.office = office;

HTMLCanvasElement.addContext('2d-libcanvas', Context2D);

return Context2D;
}();