/*
---

name: "Utils.ProgressBar"

description: "Easy way to draw progress bar"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Point
	- Shapes.Rectangle
	- Shapes.Polygon
	- Shapes.Polygon
	- Behaviors.Animatable

provides: Utils.ProgressBar

...
*/

var ProgressBar = LibCanvas.Utils.ProgressBar = Class({
	Implements: Animatable,
	initialize : function () {
		this.coord = new Point(0,0);
		this.progress = 0;
	},
	preRender : function () {
		if (this.libcanvas && this.style) {
			var htmlElem = this.libcanvas.ctx.canvas;
			this.coord.set(
				(htmlElem.width -this.style['width'] )/2,
				(htmlElem.height-this.style['height'])/2
			);
			this.line = this.renderLine();
		}
		return this;
	},
	setLibcanvas : function (libcanvas) {
		this.libcanvas = libcanvas;
		return this.preRender();
	},
	getBuffer : function () {
		if (!this.buffer) this.buffer = Buffer(this.style.width, this.style.height, true).ctx;
		return this.buffer;
	},
	drawBorder : function () {
		var s = this.style;
		
		var pbRect = new Rectangle({
			from : this.coord,
			size : Object.collect(s, ['width', 'height'])
		}).snapToPixel();

		this.libcanvas.ctx
			.fillAll(s['bgColor'])
			.fill   (pbRect, s['barBgColor'])
			.stroke (pbRect, s['borderColor']);
		return this;
	},
	drawLine : function () {
		if (this.progress > 0) {
			var line = this.line;
			var prog   = this.progress;
			var width  = ((line.width  - 2) * prog).round();
			if (width > 1) {
				var height = line.height - 2;
				var c = this.coord;

				this.libcanvas.ctx.drawImage({
					image : line,
					crop  : [    0,    0 , width-1, height-1],
					draw  : [c.x+1, c.y+1, width-1, height-1]
				});
			}
		}
		return this;
	},
	renderLine : function () {
		var b = this.getBuffer(), s = this.style;

		// Закрашиваем фон
		b.save().fillAll(s['barColor']);

		// Если нужны полоски - рисуем
		if (s['strips']) {
			b.set('fillStyle', s['stripColor']);
			// Смещение верхней части полоски относительно нижней
			var shift = 1 * s['stripShift'] || 0, stripW = 1*s['stripWidth'];
			var w = b.canvas.width, h = b.canvas.height;
			// Рисуем их по очереди , пока на холсте есть место
			for(var mv = 1; mv < w; mv += s['stripStep']) {
				b.fill(new Polygon([
					[mv + shift         , 0 ],
					[mv + shift + stripW, 0 ],
					[mv         + stripW, h ],
					[mv                 , h ]
				]));
			}
		}

		// Добавляем поверх линию, если необходимо
		if (s['blend']) {
			b.set({
				globalAlpha: s['blendOpacity'] < 1 ? s['blendOpacity'] : 0.3,
				fillStyle  : s['blendColor']
			})
			.fillRect({
				from : [ 0             , s['blendVAlign'] ],
				size : [ b.canvas.width, s['blendHeight'] ]
			});
		}
		return b.restore().canvas;
	},
	setProgress : function (progress) {
		this.update().animate({
			props: {progress: progress},
			fn: 'circ-in',
			onProccess: this.update.bind(this),
			time: 200
		});
		return this;
	},
	setStyle : function (newStyle) {
		this.update().style = newStyle;
		return this.preRender();
	},
	update: function () {
		if (this.libcanvas) this.libcanvas.update();
		return this;
	},
	draw : function () {
		this.libcanvas.ctx.save();
		this.drawBorder().drawLine();
		this.libcanvas.ctx.restore();
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Utils.ProgressBar]')
});