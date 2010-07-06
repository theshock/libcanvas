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
	originalDot : function (func, args) {
		var dot = args[0];
		if (!(args[0] instanceof LibCanvas.Dot)) {
			dot = (args.length == 2) ?
				new LibCanvas.Dot(args) :
				new LibCanvas.Dot(args[0]);
		}
		return this.original(func, [dot.x, dot.y]);
	}
};

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
		this.ctx2d[func].apply(this.ctx2d, args || []);
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
	moveTo : function (dot) {
		return office.originalDot.call(this, 'moveTo', arguments);
	},
	lineTo : function (dot) {
		return office.originalDot.call(this, 'lineTo', arguments);
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
			if ($type(a[0].angle) == 'array') {
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
			circle.x, circle.y, circle.r, angle.start, angle.end, acw
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
		return this.original('bezierCurveTo', arguments);
	},

	// transformation
	rotate : function () {
		return this.original('rotate', arguments);
	},
	translate : function () {
		return office.originalDot.call(this, 'translate', arguments);
	},
	scale : function () {
		return office.originalDot.call(this, 'scale', arguments);
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
		return this.original('measureText', arguments);
	},

	// image
	createImageData : function () {
		return this.original('createImageData', arguments);
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
			var from = a.from instanceof LibCanvas.Dot ?
				a.from : new LibCanvas.Dot(a.from);

			return this.original('drawImage', [
				a.image, from.x, from.y
			])
		} else if (a.draw) {
			var draw = a.draw instanceof LibCanvas.Shapes.Rectangle ?
				a.draw : new LibCanvas.Shapes.Rectangle(a.draw);
			if (a.crop) {
				var crop = a.crop instanceof LibCanvas.Shapes.Rectangle ?
						a.crop : new LibCanvas.Shapes.Rectangle(a.crop);

					return this.original('drawImage', [
						a.image,
						crop.from.x, crop.from.y, crop.width, crop.height,
						draw.from.x, draw.from.y, draw.width, draw.height
					])
			} else {
				return this.original('drawImage', [
					a.image, draw.from.x, draw.from.y, draw.width, draw.height
				])
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
			put.from  = a.from instanceof LibCanvas.Dot ? a.from :
				new LibCanvas.Dot(a.from);
		} else if (a.length >= 2) {
			put.image = a[0];
			if (a.length == 2) {
				put.from = a[1] instanceof LibCanvas.Dot ? a[1] :
					new LibCanvas.Dot(a[1]);
			} else {
				put.from = new LibCanvas.Dor(a[1], a[2]);
			}
		}
		return this.original('putImageData', [
			put.image, put.fom.x, put.from.y
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
		var data = this.getImageData.apply(this, arguments).data;
		var pixels = [];
		for (var i = 0, L = data.length; i < L; i+=4)  {
			pixels.push({
				r : data[i],
				g : data[i+1],
				b : data[i+2],
				a : data[i+3] / 255
			});
		}
		return pixels
	},
	getPixel : function (arg/* {rectangle, dot} */) {
		var rect = !arg.rectangle ? office.getFullRect.call(this) :
			arg.rectangle instanceof LibCanvas.Shapes.Rectangle ?
			arg.rectangle : new LibCanvas.Shapes.Rectangle
		var dot = arg.dot ?
			(arg.dot instanceof LibCanvas.Dot ? arg.dot : new LibCanvas.Dot(arg.dot)) :
			(arg instanceof LibCanvas.Dot ? arg : new LibCanvas.Dot(
				$type(arg) == 'array' ? arg : arguments
			))

		var data = this.getImageData.call(this, rect).data;
		var i = (dot.y * rect.width + dot.x) * 4;
		return {
			r : data[i],
			g : data[i+1],
			b : data[i+2],
			a : data[i+3] / 255
		};
	},
	
	// this function is only dublicated as original. maybe, i will change them,
	isPointInPath : function () {
		return this.original('isPointInPath', arguments);
	},
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