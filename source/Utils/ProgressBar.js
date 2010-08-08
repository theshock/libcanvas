/*
---
description: Provides progress bar canvas object

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.ProgressBar]
*/

LibCanvas.Utils.ProgressBar = new Class({
	initialize : function () {
		this.coord = new LibCanvas.Point;
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
	createBuffer : function () {
		return new Element('canvas', {
			width  : this.style['width'],
			height : this.style['height']
		}).getContext('2d-libcanvas');
	},
	getBuffer : function () {
		if (!this.buffer) {
			this.buffer = this.createBuffer();
		}
		return this.buffer;
	},
	drawBorder : function () {
		var s = this.style;
		
		var pbRect = new LibCanvas.Shapes.Rectangle({
			from : this.coord,
			size : [s['width'], s['height']]
		});

		this.libcanvas.ctx
			.fillAll(s['bgColor'])
			.set('fillStyle', s['barBgColor'])
			.fill(pbRect)
			.set('strokeStyle', s['borderColor'])
			.stroke(pbRect)
		return this;
	},
	drawLine : function () {
		if (this.progress > 0) {
			var line = this.line;
			var width  = line.width  - 2;
			var height = line.height - 2;
			var prog   = this.progress;
			var c = this.coord;

			this.libcanvas.ctx.drawImage({
				image : line,
				crop  : [0, 0 , width * prog, height],
				draw  : [c.x+1, c.y+1, width * prog, height]
			});
		}
		return this;
	},
	renderLine : function () {
		var b = this.getBuffer();
		var s = this.style;

		// Закрашиваем фон
		b.save();
		b.fillAll(s['barColor']);

		// Если нужны полоски - рисуем
		if (s['strips']) {
			b.set('fillStyle', s['stripColor']);
			// Смещение верхней части полоски относительно нижней
			var shift = s['stripShift'] || 0;
			// Рисуем их по очереди , пока на холсте есть место
			for(var mv = 1; mv < b.canvas.width; mv += s['stripStep']) {
				b.fill(new LibCanvas.Shapes.Polygon([
					[1*mv + 1*shift, 0],
					[1*mv + 1*s['stripWidth'] + 1*shift, 0],
					[1*mv + 1*s['stripWidth'], 1*b.canvas.height ],
					[1*mv, 1*b.canvas.height ]
				]));
			}
		}

		// Добавляем поверх линию, если необходимо
		if (s['blend']) {
			b.set('globalAlpha', s['blendOpacity'] < 1 ? s['blendOpacity'] : 0.3);
			b.set('fillStyle',   s['blendColor']);
			b.fillRect({
				from : [0, s['blendVAlign']],
				size : [b.canvas.width, s['blendHeight']]
			});
		}
		return b.restore().canvas;
	},
	setProgress : function (progress) {
		if (this.libcanvas) {
			this.libcanvas.update();
		}
		this.progress = progress;
		return this;
	},
	setStyle : function (newStyle) {
		if (this.libcanvas) {
			this.libcanvas.update();
		}
		this.style = newStyle;
		return this.preRender();
	},
	draw : function () {
		this.libcanvas.ctx.save();
		this.drawBorder()
		    .drawLine();
		this.libcanvas.ctx.restore();
		return this;
	}
});