/*
---

name: "Context2D"

description: "LibCanvas.Context2D adds new canvas context '2d-libcanvas'"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

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

(function (LibCanvas) {

var Point  = LibCanvas.Point,
    Shapes = LibCanvas.namespace('Shapes'),
    Circle = Shapes.Circle,
    Rectangle = Shapes.Rectangle;


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
		if (args.length >= 1 && args[0] instanceof LibCanvas.Shape) {
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
	
LibCanvas.Context2D = atom.Class({
	Implements: [atom.Class(accessors)],

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

	_rectangle: null,
	get rectangle () {
		var rect = this._rectangle;
		if (!rect) {
			this._rectangle = rect = new Rectangle(0, 0, this.width, this.height)
		} else {
			if (rect.width  != this.width ) rect.width  = this.width;
			if (rect.height != this.height) rect.height = this.height;
		}
		return rect;
	},
	getFullRectangle : function () {
		return this.rectangle;
	},
	original : function (method, args, returnResult) {
		try {
			var result = this.ctx2d[method].apply(this.ctx2d, args || []);
			if (returnResult) return result;
		} catch (e) {
			atom.log('Error in context2d.original(', method, ',', (args || []), ')');
			throw e;
		}
		return this;
	},
	getClone : function (width, height) {
		var resize = !!(width || height), canvas = this.canvas;
		width  = width  || canvas.width;
		height = height || canvas.height;

		var args = [canvas, 0, 0];
		if (resize) args.push(width, height);

		var clone = LibCanvas.Buffer(width, height, true);
		clone.ctx.original('drawImage', args);
		return clone;
	},

	// Values
	set : function (name, value) {
		if (typeof name == 'object') {
			for (var i in name) this[i] = name[i];
		} else this[name] = value;
		return this;
	},
	get : function (name) {
		return this[name];
	},

	// All
	fillAll : function (style) {
		return office.all.call(this, 'fill', style);
	},
	strokeAll : function (style) {
		return office.all.call(this, 'stroke', style);
	},
	clearAll : function (style) {
		return office.all.call(this, 'clear', style);
	},

	// Save/Restore
	save : function () {
		return this.original('save');
	},
	restore : function () {
		return this.original('restore');
	},

	// Fill/Stroke
	fill : function (shape) {
		return office.fillStroke.call(this, 'fill', arguments);
	},
	stroke : function (shape) {
		return office.fillStroke.call(this, 'stroke', arguments);
	},

	// Path
	beginPath : function (moveTo) {
		var ret = this.original('beginPath');
		arguments.length && this.moveTo.apply(this, arguments);
		return ret;
	},
	closePath : function () {
		arguments.length && this.lineTo.apply(this, arguments);
		return this.original('closePath');
	},
	moveTo : function (point) {
		return office.originalPoint.call(this, 'moveTo', arguments);
	},
	lineTo : function (point) {
		return office.originalPoint.call(this, 'lineTo', arguments);
	},

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

	arcTo : function () {
		// @todo Beauty arguments
		return this.original('arcTo', arguments);
	},
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
			p  = Array.from(curve.points || []).map(Point);
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
	bezierCurveTo : function () {
		var a = arguments;
		if (a.length == 6) {
			return this.original('bezierCurveTo', arguments);
		} else {
			a = a.length == 3 ? a.associate(['p1', 'p2', 'to']) : a[0];
			return this.curveTo({
				to: a.to,
				points: [a.p1, a.p2]
			});
		}
	},
	isPointInPath : function (x, y) {
		var point = Point(arguments);
		return this.original('isPointInPath', [point.x, point.y], true);
	},
	clip : function (shape) {
		if (shape && atom.typeOf(shape.processPath) == 'function') {
			shape.processPath(this);
		}
		return this.original('clip');
	},

	// transformation
	rotate : function (angle, pivot) {
		if (angle) {
			if (pivot) this.translate(pivot);
			this.original('rotate', [angle]);
			if (pivot) this.translate(pivot, true);
		}
		return this;
	},
	translate : function (point, reverse) {
		point = Point(
			(arguments.length === 1 || typeof reverse === 'boolean')
				? point : arguments
		);
		var multi = reverse === true ? -1 : 1;
		this.original('translate', [point.x * multi, point.y * multi]);
		return this;
	},
	scale : function () {
		return office.originalPoint.call(this, 'scale', arguments);
	},
	transform : function () {
		// @todo Beauty arguments
		return this.original('transform', arguments);
	},
	setTransform : function () {
		// @todo Beauty arguments
		return this.original('setTransform', arguments);
	},

	// Rectangle
	fillRect : function (rectangle) {
		return office.rect.call(this, 'fillRect', arguments);
	},
	strokeRect : function (rectangle) {
		return office.rect.call(this, 'strokeRect', arguments);
	},
	clearRect : function (rectangle) {
		return office.rect.call(this, 'clearRect', arguments);
	},

	// text
	fillText : function (text, x, y, maxWidth) {
		return this.original('fillText', arguments);
	},
	strokeText : function (text, x, y, maxWidth) {
		return this.original('strokeText', arguments);
	},
	measureText : function (textToMeasure) {
		return this.original('measureText', arguments, true);
	},
	text : function (cfg) {
		if (!this.ctx2d.fillText) return this;
		
		cfg = atom.extend({
			text   : '',
			color  : null, /* @color */
			wrap   : 'normal', /* no|normal */
			to     : null,
			align  : 'left', /* center|left|right */
			size   : 16,
			weigth : 'normal', /* bold|normal */
			style  : 'normal', /* italic|normal */
			family : 'sans-serif', /* @fontFamily */
			lineHeight : null,
			overflow   : 'visible', /* hidden|visible */
			padding : [0,0]
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
		if (cfg.color) this.set('fillStyle', cfg.color);
		if (cfg.overflow == 'hidden') this.clip(to);
		
		var xGet = function (lineWidth) {
			var al = cfg.align, pad = cfg.padding[1];
			return al == 'left'  ? to.from.x + pad :
			       al == 'right' ? to.to.x - lineWidth - pad :
			           to.from.x + (to.width - lineWidth)/2;
		};
		var x, lines = String(cfg.text).split('\n');
		var measure = function (text) {
			return this.measureText(text).width;
		}.context(this);
		if (cfg.wrap == 'no') {
			lines.forEach(function (line, i) {
				this.fillText(line, xGet(cfg.align == 'left' ? 0 : this.measureText(line).width), to.from.y + (i+1)*lh);
			}.context(this));
		} else {
			var lNum = 0;
			lines.forEach(function (line) {
				var words = line.match(/.+?(\s|$)/g);
				var L  = '';
				var Lw = 0;
				for (var i = 0; i <= words.length; i++) {
					var last = i == words.length;
					if (!last) {
						var text = words[i];
						// @todo too slow. 2-4ms for 50words
						var wordWidth = this.measureText(text).width;
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
			}.context(this));
			
		}
		return this.restore();
	},

	// image
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

	drawImage : function (a) {
		if (arguments.length > 2) return this.original('drawImage', arguments);
		if (arguments.length == 2) {
			a = { image: a, draw: arguments[1] };
		} else if (atom.typeOf(a) == 'element') {
			return this.original('drawImage', [a, 0, 0]);
		}

		if (!a.image) throw new TypeError('No image');
		var center, from = a.center || a.from;

		this.save();
		if (from) {
			from = Point(from);
			if (a.center) from = {
				x : from.x - a.image.width/2,
				y : from.y - a.image.height/2
			};
			if (a.angle) {
				center = a.center || {
					x : from.x + a.image.width/2,
					y : from.y + a.image.height/2
				};
				this.rotate(a.angle, center);
			}
			this.original('drawImage', [
				a.image, from.x, from.y
			]);
		} else if (a.draw) {
			var draw = Rectangle(a.draw);
			if (a.angle) this.rotate(a.angle, draw.center);

			if (a.crop) {
				var crop = Rectangle(a.crop);
				this.original('drawImage', [
					a.image,
					crop.from.x, crop.from.y, crop.width, crop.height,
					draw.from.x, draw.from.y, draw.width, draw.height
				]);
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
	projectiveImage : function (arg) {
		// test
		new LibCanvas.Inner.ProjectiveTexture(arg.image)
			.setContext(this.ctx2d)
			.setQuality(arg.patchSize, arg.limit)
			.render(new Shapes.Polygon(Array.collect(arg, [0, 1, 3, 2])));
		return this;
	},

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
		return this.original('createLinearGradient', a, true);
	},
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

		return this.original('createRadialGradient', points, true);
	},

	createPattern : function () {
		return this.original('createPattern', arguments, true);
	},
	drawWindow : function () {
		return this.original('drawWindow', arguments);
	},
	toString: Function.lambda('[object LibCanvas.Context2D]')
	// Such moz* methods wasn't duplicated:
	// mozTextStyle, mozDrawText, mozMeasureText, mozPathText, mozTextAlongPath

	// is this just properties , that can be used by set ?
	// shadowOffsetX shadowOffsetY shadowBlur shadowColor
});

LibCanvas.Context2D.office = office;

HTMLCanvasElement.addContext('2d-libcanvas', LibCanvas.Context2D);

})(LibCanvas);