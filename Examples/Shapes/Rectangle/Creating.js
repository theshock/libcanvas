/*
---

name: "Shapes.Rectangle.Creating"

description: "Shapes.Rectangle.Creating"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: Shapes.Rectangle.Creating

...
*/

LibCanvas.Examples.set('Shapes.Rectangle.Creating', function (canvas) {
	atom(canvas).css('background', 'url(/files/bg.jpg)');

	var LC = LibCanvas.extract({});

	var libcanvas = new LibCanvas(canvas, {
			clear: true
		})
		.set({
			width : 512,
			height: 256
		})
		.listenMouse()
	
	var cache = libcanvas.createBuffer();


	var closeLastRectangle = function () {
		if ( last ) {
			libcanvas.rmElement(last);
			last.setOptions({
				fill   : 'rgba(192, 192, 192, 0.4)',
				stroke : 'rgba(  0,   0,   0, 0.4)'
			});
			last.drawTo(cache.getContext('2d-libcanvas'));
			last.drawTo(libcanvas.ctx);
			last = null;
		}
	};

	var last = null;
	var rectCount = 0;

	atom(libcanvas.origElem).bind({
		mousedown : function (e) {
			var start = libcanvas.mouse.getOffset(e);
			last = libcanvas
				.createShaper({
					shape : new LC.Rectangle( start.clone(), start.clone() ),
					fill   : 'rgba(255, 192, 192, 0.4)',
					stroke : 'rgba(127,   0,   0, 0.4)'
				})
				.setZIndex(++rectCount);
		},
		mousemove : function (e) {
			if ( last ) {
				last.getShape().to.moveTo(
					libcanvas.mouse.getOffset(e)
				);
				libcanvas.update();
			}
		},
		mouseup  : closeLastRectangle,
		mouseout : closeLastRectangle
	});

	libcanvas.start(function () {
		libcanvas.ctx.drawImage(cache, 0, 0);
	});
});