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

var Point     = LibCanvas.Point,
	Shapes    = LibCanvas.namespace('Shapes'),
	Rectangle = Shapes.Rectangle,
	Circle    = Shapes.Circle,
	PointFrom = Point.from.context(Point);


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
		return args.length ?
			Rectangle.from(args) :
			this.getFullRectangle();
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
		var point = Point.from(args);
		return this.original(func, [point.x, point.y]);
	},
	createImageCacheData : function (a) {
		var draw = Rectangle.from(a.draw);
		var crop = a.crop ? Rectangle.from(a.crop) : null;
		return {
			src : a.image.getAttribute('src') || '',
			image : a.image,
			crop : crop ? {
				x : crop.from.x,
				y : crop.from.y,
				w : crop.getWidth(),
				h : crop.getHeight()
			} : null,
			draw : {
				x : 0,
				y : 0,
				w : draw.getWidth(),
				h : draw.getHeight()
			}
		};
	},
	getImageCache : function (data) {
		var src = imageCache[data.src];
		if (src) for (var i = src.length; i--;) {
			if (Array.deepEquals(src[i].data, data)) {
				return src[i].cache;
			}
		}
		return false;
	},
	putImageCache : function (data, cache) {
		data = office.createImageCacheData(data);
		var src = imageCache[data.src];
		if (!src) src = imageCache[data.src] = [];
		src.push({
			data  : data,
			cache : cache
		});
	},
	getRotatedImageCache : function (data, length) {
		var index = data.angle
			.normalizeAngle()
			.getDegree()
			.toFixed(length);
		var cache = rotatedImageCache[index];
		if (cache) {
			for (var i = cache.length; i--;) {
				if (cache[i].image == data.image) {
					return cache[i].cache;
				}
			}
		}
		return null;
	},
	putRotatedImageCache : function (data, cache, length) {
		var index = data.angle
			.normalizeAngle()
			.getDegree()
			.toFixed(length);
		if (!rotatedImageCache[index]) {
			rotatedImageCache[index] = [];
		}
		rotatedImageCache[index].push({
			image : data.image,
			cache : cache
		});
	}
};

var rotatedImageCache = {};
var imageCache = {};

var canvasProperties = ['width', 'height'].toKeys();

LibCanvas.Context2D = atom.Class({
	initialize : function (canvas) {
		if (canvas instanceof CanvasRenderingContext2D) {
			this.ctx2d  = canvas;
			this.canvas = this.ctx2d.canvas;
		} else {
			this.canvas = canvas;
			this.ctx2d  = canvas.getOriginalContext('2d');
		}
	},
	get width() {
		return this.canvas.width;
	},
	get height() {
		return this.canvas.height;
	},

	getFullRectangle : function () {
		return new Rectangle(0, 0, this.width, this.height);
	},
	original : function (method, args) {
		try {
			this.ctx2d[method].apply(this.ctx2d, args || []);
		} catch (e) {
			console.log('ctx', this, this.ctx2d);
			atom.log('Error in context2d.original(', method, ',', (args || []), ')');
			throw e;
		}
		return this;
	},
	getClone : function (width, height) {
		width  = width  || canvas.width;
		height = height || canvas.height
		var canvas = this.canvas, clone  = LibCanvas.Buffer(width, height);
		var ctx = clone.getContext('2d');
		!arguments.length ? ctx.drawImage(canvas, 0, 0) :
			ctx.drawImage(canvas, 0, 0, width, height);
		return clone;
	},

	// Values
	set : function (name, value) {
		if (typeof name == 'object') {
			for (var i in name) this.set(i, name[i]);
			return this;
		}
		var object = (name in canvasProperties) ?
			'canvas' : 'ctx2d';
		try {
			this[object][name] = value;
		} catch (e) {
			throw TypeError('Exception while setting «' + name + '» to «' + value + '»: ' + e.message);
		}
		return this;
	},
	get : function (name) {
		return this.ctx2d[name];
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
			circle = Circle.from(a[0].circle);
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
		var p  = Array.from(curve.points || []).map(PointFrom),
			l  = p.length,
			to = Point.from(curve.to);
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
		// @todo Beauty arguments
		return this.original('quadraticCurveTo', arguments);
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
		if (arguments.length == 2) {
			return this.ctx2d.isPointInPath(x, y);
		} else {
			var point = Point.from(x);
			return this.ctx2d.isPointInPath(point.x, point.y);
		}		
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
			this.ctx2d.rotate(angle);
			if (pivot) this.translate(pivot, true);
		}
		return this;
	},
	translate : function (point, reverse) {
		point = Point.from(
			(arguments.length === 1 || typeof reverse === 'boolean')
				? point : arguments
		);
		var multi = reverse === true ? -1 : 1;
		this.ctx2d.translate(point.x * multi, point.y * multi);
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
		// @todo Beauty arguments
		return this.original('fillText', arguments);
	},
	strokeText : function (text, x, y, maxWidth) {
		// @todo Beauty arguments
		return this.original('strokeText', arguments);
	},
	measureText : function (textToMeasure) {
		return this.ctx2d.measureText.apply(this.ctx2d, arguments);
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
		var to = cfg.to ? Rectangle.from(cfg.to) : this.getFullRectangle();
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
		var x, lines = cfg.text.split('\n');
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
		return this.original('createImageData', arguments);
	},

	// @deprecated
	cachedDrawImage : function (a) {
		if (!a.image || !a.draw) {
			return this.drawImage.apply(this, arguments);
		}
		var data = office.createImageCacheData(a);
		var cache = office.getImageCache(data);
		if (!cache) {
			// cache object
			cache = LibCanvas.Buffer(data.draw.w, data.draw.h);
			cache.getContext('2d-libcanvas')
				.drawImage(data);
			office.putImageCache(data, cache);
		}
		var draw = Rectangle.from(a.draw);
		var result = {
			image : cache,
			from  : draw.from
		};
		return this.drawImage(result);
	},
	// @deprecated
	rotatedImage : function (data, cacheLength) {
		var cacheEnabled = cacheLength !== false;
		cacheLength = (cacheLength * 1) || 0;
		if (!(data.angle.normalizeAngle().getDegree(3) % 360)) {
			return this.drawImage(data);
		}
		var cache = cacheEnabled && office.getRotatedImageCache(data, cacheLength);
		if (!cache) {
			var diagonal = Math.hypotenuse(data.image.width, data.image.height);
			cache = LibCanvas.Buffer(diagonal, diagonal);
			cache.getContext('2d-libcanvas')
				.translate(diagonal/2, diagonal/2)
				.rotate(data.angle)
				.drawImage(data.image, -data.image.width/2, -data.image.height/2);
			cacheEnabled && office.putRotatedImageCache(data, cache, cacheLength);
		}
		var from;
		if (data.center) {
			from = Point.from(data.center).clone().move({
				x : -cache.width /2,
				y : -cache.height/2
			});
		} else {
			from = Point.from(data.from).clone().move({
				x : from.x - (cache.width  - data.image.width )/2,
				y : from.y - (cache.height - data.image.height)/2
			});
		}
		return this.drawImage({
			image : cache,
			from  : from
		});
	},
	drawImage : function (a) {
		if (arguments.length > 1) return this.original('drawImage', arguments);
		if (atom.typeOf(a) == 'element') return this.original('drawImage', [a, 0, 0]);

		if (!a.image) throw new TypeError('No image');
		var center, from = a.center || a.from;

		this.save();
		if (from) {
			from = Point.from(from);
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
			var draw = Rectangle.from(a.draw);
			if (a.angle) this.rotate(a.angle, draw.getCenter());

			if (a.crop) {
				var crop = Rectangle.from(a.crop);
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
		var a = arguments;
		var put = {};
		if (a.length == 1 && typeof a == 'object') {
			a = a[0];
			put.image = a.image;
			put.from  = Point.from(a.from);
		} else if (a.length >= 2) {
			put.image = a[0];
			put.from = Point.from(a.length > 2 ? [a[1], a[2]] : a[1]);
		}
		return this.original('putImageData', [
			put.image, put.from.x, put.from.y
		]);
	},
	getImageData : function (rectangle) {
		var rect = office.makeRect.call(this, arguments);
		return this.ctx2d.getImageData(rect.from.x, rect.from.y, rect.getWidth(), rect.getHeight());
	},
	getPixels : function (rectangle) {
		var rect = office.makeRect.call(this, arguments);
		var data = this.getImageData(rect).data;

		var result = [], line = [];
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
	// this function is only dublicated as original. maybe, i will change them,
	createLinearGradient : function () {
		return this.ctx2d.createLinearGradient.apply(this.ctx2d, arguments);
	},
	createRadialGradient : function () {
		return this.ctx2d.createRadialGradient.apply(this.ctx2d, arguments);
	},
	createPattern : function () {
		return this.ctx2d.createPattern.apply(this.ctx2d, arguments);
	},
	drawWindow : function () {
		return this.original('drawWindow', arguments);
	}
	// Such moz* methods wasn't duplicated:
	// mozTextStyle, mozDrawText, mozMeasureText, mozPathText, mozTextAlongPath

	// is this just properties , that can be used by set ?
	// shadowOffsetX shadowOffsetY shadowBlur shadowColor
});

LibCanvas.Context2D.office = office;

HTMLCanvasElement.addContext('2d-libcanvas', LibCanvas.Context2D);

})(LibCanvas);