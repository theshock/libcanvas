(function () {

var office = {
	all : function (type, style) {
		this.save();
		if (style) {
			this.set(type + 'Style', style);
		}
		this[type + 'Rect'](office.getFullRect.call(this));
		this.restore();
		return this;
	},
	rect : function (func, args) {
		var rect;
		if (args.length == 0) {
			rect = office.getFullRect.call(this);
		} else if (args[0] instanceof LibCanvas.Shapes.Rectangle) {
			rect = args[0];
		} else {
			rect = new LibCanvas.Shapes.Rectangle()
			rect.set.apply(rect, args);
		}
		return this.original(func,
			[rect.from.x, rect.from.y, rect.width, rect.height]);
	},
	getFullRect : function () {
		return new LibCanvas.Shapes.Rectangle(0, 0, this.width, this.height);
	},
	fillStroke : function (type, args) {
		if (args.length >= 1 && args[0] instanceof LibCanvas.Shape) {
			if (args[1]) {
				this.save().set(type + 'Style', args[1]);
			}
			args[0].draw(this, type);
			if (args[1]) {
				this.restore();
			}
		} else {
			if (args.length && args[0]) {
				this.save().set(type + 'Style', args[0]);
			}
			this.original(type);
			if (args.length && args[0]) {
				this.restore();
			}
		}
		
		return this;
	},
	originalPoint : function (func, args) {
		var point = args[0];
		if (!(args[0] instanceof LibCanvas.Point)) {
			point = (args.length == 2) ?
				new LibCanvas.Point(args) :
				new LibCanvas.Point(args[0]);
		}
		return this.original(func, [point.x, point.y]);
	},
	makeRect : function (obj) {
		return obj instanceof LibCanvas.Shapes.Rectangle ?
			obj : new LibCanvas.Shapes.Rectangle(obj);
	},
	createImageCacheData : function (a) {
		var draw = office.makeRect(a.draw);
		var crop = a.crop ? office.makeRect(a.crop) : null;
		return {
			src : a.image.getAttribute('src') || '',
			image : a.image,
			crop : crop ? {
				x : crop.from.x,
				y : crop.from.y,
				w : crop.width,
				h : crop.height
			} : null,
			draw : {
				x : 0,
				y : 0,
				w : draw.width,
				h : draw.height
			}
		};
	},
	getImageCache : function (data) {
		var src = imageCache[data.src];
		if (src) {
			for (var i = src.length; i--;) {
				if ($equals(src[i].data, data)) {
					return src[i].cache;
				}
			}
		}
		return false;
	},
	putImageCache : function (data, cache) {
		data = office.createImageCacheData(data);
		var src = imageCache[data.src];
		if (!src) {
			src = imageCache[data.src] = [];
		}
		src.push({
			data  : data,
			cache : cache
		});
	}
};

var imageCache = {};

LibCanvas.Context2D = new Class({
	initialize : function (canvas) {
		if (canvas instanceof CanvasRenderingContext2D) {
			this.ctx2d  = canvas;
			this.canvas = this.ctx2d.canvas;
		} else {
			this.canvas = canvas;
			this.ctx2d  = canvas.getOriginalContext('2d');
		}
		// We shouldn't think about size, LibCanvas should think
		this.width  = this.canvas.width;
		this.height = this.canvas.height;
	},
	original : function (func, args) {
		try {
			this.ctx2d[func].apply(this.ctx2d, args || []);
		} catch (e) {
			new Date().getTime();
			throw e;
		}
		return this;
	},

	// All
	fillAll : function (style) {
		office.all.call(this, 'fill', style);
		return this;
	},
	strokeAll : function (style) {
		office.all.call(this, 'stroke', style);
		return this;
	},
	clearAll : function (style) {
		office.all.call(this, 'clear', style);
		return this;
	},

	// Save/Restore
	save : function () {
		return this.original('save');
	},
	restore : function () {
		return this.original('restore');
	},

	// Values
	set : function (name, value) {
		this.ctx2d[name] = value;
		return this;
	},
	get : function (name) {
		return this.ctx2d[name];
	},

	// Fill/Stroke
	fill : function (shape) {
		return office.fillStroke.call(this, 'fill', arguments);
		return this;
	},
	stroke : function (shape) {
		return office.fillStroke.call(this, 'stroke', arguments);
	},

	// Path
	beginPath : function () {
		return this.original('beginPath');
	},
	closePath : function () {
		return this.original('closePath');
	},
	clip : function () {
		return this.original('clip');
	},
	moveTo : function (point) {
		return office.originalPoint.call(this, 'moveTo', arguments);
	},
	lineTo : function (point) {
		return office.originalPoint.call(this, 'lineTo', arguments);
	},

	arc : function (x, y, r, startAngle, endAngle, anticlockwise) {
		var a = arguments;
		var circle, angle, acw;
		if (a.length == 6) {
			return this.original('arc', a);
			// Optimization ?
			circle = new LibCanvas.Shapes.Circle(x, y, r);
			angle  = {
				start : startAngle,
				end   :   endAngle
			};
			acw = !!anticlockwise;
		} else if (a[0].circle) {
			circle = a[0].circle instanceof LibCanvas.Shapes.Circle ? a[0].circle :
				new LibCanvas.Shapes.Circle(a[0].circle);
			var ang = a[0].angle;
			if ($type(ang) == 'array') {
				angle = {
					start : ang[0],
					end   : ang[1]
				}
			} else {
				angle = {
					start : [ ang.start, ang.s ].firstReal(),
					end   : [ ang.end  , ang.e ].firstReal()
				}
				if ($chk(ang.size) && !$chk(angle.end)) {
					angle.end = ang.size + angle.start;
				}
				if ($chk(ang.size) && !$chk(angle.start)) {
					angle.start = angle.end - ang.size;
				}
			}
			acw = !!a[0].anticlockwise || !!a[0].acw;
		} else {
			throw 'Wrong Argumentss In CanvasContext.Arc';
		}
		return this.original('arc', [
			circle.center.x, circle.center.y, circle.radius, angle.start, angle.end, acw
		]);
	},

	arcTo : function () {
		// @todo Beauty arguments
		return this.original('arcTo', arguments);
	},
	quadraticCurveTo : function () {
		// @todo Beauty arguments
		return this.original('quadraticCurveTo', arguments);
	},
	bezierCurveTo : function () {
		// @todo Beauty arguments
		if (arguments.length == 6) {
			return this.original('bezierCurveTo', arguments);
		} else {
			var a = arguments[0];
			return this.original('bezierCurveTo', [
				a.p1.x, a.p1.y, a.p2.x, a.p2.y, a.to.x, a.to.y
			]);
		}
	},
	isPointInPath : function (x, y) {
		var args = arguments;
		if (args.length == 2) {
			return this.ctx2d.isPointInPath(x, y);
		} else {
			var point = args[0];
			if (!(args[0] instanceof LibCanvas.Point)) {
				point = LibCanvas.Point(args[0]);
			}
			return this.ctx2d.isPointInPath(point.x, point.y);
		}		
	},

	// transformation
	rotate : function () {
		return this.original('rotate', arguments);
	},
	translate : function () {
		return office.originalPoint.call(this, 'translate', arguments);
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

	// image
	createImageData : function () {
		return this.original('createImageData', arguments);
	},
	cachedDrawImage : function (a) {
		if (!a.image || !a.draw) {
			return this.drawImage.apply(this, arguments);
		}
		var data = office.createImageCacheData(a);
		var cache = office.getImageCache(data);
		if (!cache) {
			var canvas = new Element('canvas', {
				width  : data.draw.w,
				height : data.draw.h
			});
			canvas.getContext('2d-libcanvas')
				.drawImage(data);
			office.putImageCache(data, canvas);
			cache = canvas;
		}
		var draw = office.makeRect(a.draw);
		var result = {
			image : cache,
			from  : draw
		}
		return this.drawImage(result);
	},
	drawImage : function () {
		var a = arguments;
		if ([3, 5, 9].contains(a.length)) {
                    return this.original('drawImage', a);
		}
		a = a[0];
		if (!a.image) {
			throw 'No image';
		}
		if (a.from) {
			var from = $chk(a.from.x) && $chk(a.from.y) ? a.from :
				a.from instanceof LibCanvas.Point ?
					a.from : new LibCanvas.Point(a.from);
			return this.original('drawImage', [
				a.image, from.x, from.y
			])
		} else if (a.draw) {
			var draw = office.makeRect(a.draw);
			if (a.crop) {
				var crop = office.makeRect(a.crop);
				return this.original('drawImage', [
					a.image,
					crop.from.x, crop.from.y, crop.width, crop.height,
					draw.from.x, draw.from.y, draw.width, draw.height
				])
			} else {
				return this.original('drawImage', [
					a.image, draw.from.x, draw.from.y, draw.width, draw.height
				]);
			}
		} else {
			throw 'Wrong Args in Context.drawImage';
		}
	},
	projectiveImage : function (arg) {
		var drawTo = new LibCanvas.Shapes.Polygon([
			arg.draw[0], arg.draw[1], arg.draw[3], arg.draw[2]
		]);
		new LibCanvas.Inner.ProjectiveTexture(arg.image)
			.setContext(this.ctx2d)
			.setQuality(arg.patchSize, arg.limit)
			.render(drawTo);
		return this;
	},
	putImageData : function () {
		var a = arguments;
		var put = {};
		if (a.length == 1 && typeof a == 'object') {
			a = a[0];
			put.image = a.image;
			put.from  = a.from instanceof LibCanvas.Point ? a.from :
				new LibCanvas.Point(a.from);
		} else if (a.length >= 2) {
			put.image = a[0];
			if (a.length == 2) {
				put.from = a[1] instanceof LibCanvas.Point ? a[1] :
					new LibCanvas.Point(a[1]);
			} else {
				put.from = new LibCanvas.Point(a[1], a[2]);
			}
		}
		return this.original('putImageData', [
			put.image, put.from.x, put.from.y
		]);
	},
	getImageData : function (rectangle) {
		var args = arguments;
		var rect;
		if (args.length == 0) {
			rect = office.getFullRect.call(this);
		} else if (args[0] instanceof LibCanvas.Shapes.Rectangle) {
			rect = args[0];
		} else {
			rect = new LibCanvas.Shapes.Rectangle()
			rect.set.apply(rect, args);
		}
		return this.ctx2d.getImageData(rect.from.x, rect.from.y, rect.width, rect.height);
	},
	getPixels : function (rectangle) {
		var args = arguments;
		var rect;
		if (args.length == 0) {
			rect = office.getFullRect.call(this);
		} else if (args[0] instanceof LibCanvas.Shapes.Rectangle) {
			rect = args[0];
		} else {
			rect = new LibCanvas.Shapes.Rectangle()
			rect.set.apply(rect, args);
		}
		var data = this.getImageData(rect).data;

		var dump = [];

		var pixels = [];
		for (var i = 0, L = data.length; i < L; i+=4)  {
			pixels.push({
				r : data[i],
				g : data[i+1],
				b : data[i+2],
				a : data[i+3] / 255
			});
			if (pixels.length == rect.width) {
				dump.push(pixels);
				pixels = [];
			}
		}
		return dump;
	},
	getPixel : function (arg/* {rectangle, point} */) {
		var rect = !arg.rectangle ? office.getFullRect.call(this) :
			arg.rectangle instanceof LibCanvas.Shapes.Rectangle ?
			arg.rectangle : new LibCanvas.Shapes.Rectangle
		var point = arg.point ?
			(arg.point instanceof LibCanvas.Point ? arg.point : new LibCanvas.Point(arg.point)) :
			(arg instanceof LibCanvas.Point ? arg : new LibCanvas.Point(
				$type(arg) == 'array' ? arg : arguments
			))

		var data = this.getImageData.call(this, rect).data;
		var i = (point.y * rect.width + point.x) * 4;
		return {
			r : data[i],
			g : data[i+1],
			b : data[i+2],
			a : data[i+3] / 255
		};
	},
	// this function is only dublicated as original. maybe, i will change them,
	createLinearGradient : function () {
		return this.original('createLinearGradient', arguments);
	},
	createRadialGradient : function () {
		return this.original('createRadialGradient', arguments);
	},
	createPattern : function () {
		return this.original('createPattern', arguments);
	},
	drawWindow : function () {
		return this.original('drawWindow', arguments);
	}
	// Such moz* methods wasn't duplicated:
	// mozTextStyle, mozDrawText, mozMeasureText, mozPathText, mozTextAlongPath

	// is this just properties , that can be used by set ?
	// shadowOffsetX shadowOffsetY shadowBlur shadowColor
});

LibCanvas.addCanvasContext('2d-libcanvas', LibCanvas.Context2D);

})();