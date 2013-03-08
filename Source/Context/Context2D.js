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
	- Size
	- Shapes.Rectangle
	- Shapes.Circle
	- Core.Canvas
	- Context.DrawImage
	- Context.Gradients
	- Context.Path
	- Context.Pixels
	- Context.Text

provides: Context2D

...
*/

/**
 * @class
 * @name Context2D
 * @name LibCanvas.Context2D
 */
var Context2D = function () {

var office = {
	all : function (type, style) {
		this.save();
		if (style) this.set(type + 'Style', style);
		this[type + 'Rect'](this.rectangle);
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

/* In some Mobile browsers shadowY should be inverted (bug) */
var shadowBug = function () {
	// todo: use LibCanvas.buffer
	var ctx = atom.dom
		.create('canvas', { width: 15, height: 15 })
		.first.getContext( '2d' );

	ctx.shadowBlur    = 1;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = -5;
	ctx.shadowColor   = 'green';

	ctx.fillRect( 0, 5, 5, 5 );

	// Color should contains green component to be correct (128 is correct value)
	return ctx.getImageData(0, 0, 1, 1).data[1] < 64;

}();

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
	},

	SHADOW_BUG: shadowBug

};

var Context2D = LibCanvas.declare( 'LibCanvas.Context2D', 'Context2D',
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
	initialize : function (canvas) {
		if (canvas instanceof CanvasRenderingContext2D) {
			this.ctx2d  = canvas;
			this.canvas = this.ctx2d.canvas;
		} else {
			this.canvas = canvas;
			this.ctx2d  = atom.core.isFunction(canvas.getOriginalContext) ?
				canvas.getOriginalContext('2d') :
				canvas.getContext('2d');
		}

		this.helpers = {
			image    : new LibCanvas.Context.DrawImage(this),
			gradients: new LibCanvas.Context.Gradients(this),
			pixels   : new LibCanvas.Context.Pixels   (this),
			text     : new LibCanvas.Context.Text     (this),
			path     : new LibCanvas.Context.Path     (this)
		};
	},
	get width () { return this.canvas.width; },
	get height() { return this.canvas.height; },
	set width (width)  { this.canvas.width  = width; },
	set height(height) { this.canvas.height = height;},
	
	get size () { 
		return new Size(this.width, this.height);
	},
	set size (size) {
		size = Size.from(size);
		this.width  = size.width;
		this.height = size.height;
	},
	

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

	/** @private */
	safeSet: function (property, value) {
		try {
			this.ctx2d[property] = value;
		} catch (e) {
			throw TypeError('Exception while setting «' + property + '» to «' + value + '»: ' + e.message);
		}
	},

	set shadowOffsetY (value) {
		if (shadowBug) value *= -1;
		this.safeSet('shadowOffsetY', value);
	},

	set shadowBlur (value) {
		if (shadowBug && value < 1) value = 1;
		this.safeSet('shadowBlur', value);
	},

	get shadowOffsetY () {
		return this.ctx2d.shadowOffsetY;
	},

	get shadowBlur () {
		return this.ctx2d.shadowBlur;
	},

	get opacity () {
		return this.globalAlpha;
	},

	set opacity (value) {
		this.globalAlpha = value;
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
	/** @returns {Context2D} */
	original : function (method, args, returnResult) {
		var result = this.ctx2d[method].apply(this.ctx2d, args || []);
		return returnResult ? result: this;
	},
	/** @returns {HTMLCanvasElement} */
	getClone : function (width, height) {
		var resize = !!(width || height), canvas = this.canvas;
		width  = width  || canvas.width;
		height = height || canvas.height;

		var args = [canvas, 0, 0];
		if (resize) args.push(width, height);

		var clone = LibCanvas.buffer(width, height, true);
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
	clearAll : function () {
		return this.ctx2d.clearRect(0,0,this.canvas.width,this.canvas.height);
	},

	// Save/Restore
	/** @returns {Context2D} */
	save : function () {
		this.ctx2d.save();
		return this;
	},
	/** @returns {Context2D} */
	restore : function () {
		this.ctx2d.restore();
		return this;
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
	clear: function (shape, stroke) {
		return shape instanceof Shape && shape.constructor != Rectangle ?
			this
				.save()
				.set({ globalCompositeOperation: Context2D.COMPOSITE.DESTINATION_OUT })
				[stroke ? 'stroke' : 'fill']( shape )
				.restore() :
			this.clearRect( Rectangle.from(shape) );
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
		return this.helpers.path.arc(arguments);
	},
	/** @returns {Context2D} */
	arcTo : function () {
		return this.helpers.path.arcTo(arguments);
	},
	/** @returns {Context2D} */
	curveTo: function (curve) {
		return this.helpers.path.curveTo(arguments);
	},
	/** @returns {Context2D} */
	quadraticCurveTo : function () {
		return this.helpers.path.quadraticCurveTo(arguments);
	},
	/** @returns {Context2D} */
	bezierCurveTo : function () {
		return this.helpers.path.bezierCurveTo(arguments);
	},
	/** @returns {boolean} */
	isPointInPath : function (x, y) {
		return this.helpers.path.isPointInPath(x, y);
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

	// === helpers.text === //

	/** @returns {Context2D} */
	fillText : function (text, x, y, maxWidth) {
		return this.helpers.text.fillText(text, x, y, maxWidth);
	},
	/** @returns {Context2D} */
	strokeText : function (text, x, y, maxWidth) {
		return this.helpers.text.strokeText(text, x, y, maxWidth);
	},
	/** @returns {object} */
	measureText : function (textToMeasure) {
		return this.helpers.text.measureText(arguments);
	},
	/** @returns {Context2D} */
	text : function (cfg) {
		return this.helpers.text.text(cfg);
	},

	// === helpers.drawImage === //

	/** @returns {Context2D} */
	drawImage : function () {
		return this.helpers.image.drawImage(arguments);
	},

	// === helpers.pixels === //

	/** @returns {CanvasPixelArray} */
	createImageData : function (w, h) {
		return this.helpers.pixels.createImageData(w, h);
	},
	/** @returns {Context2D} */
	putImageData : function () {
		return this.helpers.pixels.putImageData(arguments);
	},
	/** @returns {CanvasPixelArray} */
	getImageData : function (rectangle) {
		return this.helpers.pixels.getImageData(arguments);
	},
	getPixels : function (rectangle) {
		return this.helpers.pixels.getPixels(arguments);
	},
	getPixel: function (point) {
		return this.helpers.pixels.getPixel(point);
	},

	// === helpers.gradients === //

	/** @returns {CanvasGradient} */
	createGradient: function (from, to, colors) {
		return this.helpers.gradients.createGradient(from, to, colors);
	},
	/** @returns {CanvasGradient} */
	createRectangleGradient: function (rectangle, colors) {
		return this.helpers.gradients.createRectangleGradient(rectangle, colors);
	},
	/** @returns {CanvasGradient} */
	createLinearGradient : function () {
		return this.helpers.gradients.createLinearGradient(arguments);
	},
	/** @returns {CanvasGradient} */
	createRadialGradient: function () {
		return this.helpers.gradients.createRadialGradient(arguments);
	},

	// === etc === //

	/** @returns {CanvasPattern} */
	createPattern : function () {
		return this.original('createPattern', arguments, true);
	},

	drawWindow : function () {
		return this.original('drawWindow', arguments);
	}

}).own(constants);


[ 'fillStyle','font','globalAlpha','globalCompositeOperation','lineCap',
  'lineJoin','lineWidth','miterLimit','shadowOffsetX','shadowColor',
  'strokeStyle','textAlign','textBaseline'
	// we'll set this values manually because of bug in Mobile Phones
	// 'shadowOffsetY','shadowBlur'
].forEach(function (property) {
	atom.accessors.define(Context2D.prototype, property, {
		set: function (value) {
			this.safeSet(property, value);
		},
		get: function () {
			return this.ctx2d[property];
		}
	})
});

Context2D.office = office;

if (atom.core.isFunction(HTMLCanvasElement.addContext)) {
	HTMLCanvasElement.addContext('2d-libcanvas', Context2D);
}

return Context2D;

}();
