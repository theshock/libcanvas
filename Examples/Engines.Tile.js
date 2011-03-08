/*
---

name: "Engines.Tile"

description: "Engines.Tile"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: Engines.Tile

...
*/

LibCanvas.Examples.set('Engines.Tile',
	function (canvas) {
		
		new LibCanvas(canvas, {
			backBuffer: 'off',
			preloadImages: { sprite: '/files/sprite-ok.png' }
		})
		.listenMouse()
		.size(32*6, 32*4, true)
		.addEvent('ready', function () {
			var cells = [
				['c','c','c','c','c','c'],
				['f','f','c','f','f','c'],
				['c','c','c','f','f','c'],
				['c','c','f','c','c','c']
			];
			
			var engine = new LibCanvas.Engines.Tile(this.elem)
				.setSize(32, 32)
				.addTiles({
					c: '#030',
					a: '#036',
					i: this.getImage('sprite'),
					f: function (ctx, rect) {
						ctx.stroke(new Line(rect.from, rect.to), '#66f');
						ctx.stroke(new Line(
							[rect.from.x, rect.to.y],
							[rect.to.x, rect.from.y]
						), '#66f');
					}
				})
				.setMatrix(cells)
				.update();
			
			this.mouse.addEvent('click', function (e) {
				var cell = engine.getCell(e.offset);
				if (['c', 'i', 'a'].contains(cell.t)) {
					cells[cell.y][cell.x] = cell.t == 'i' ? 'a' : 'i';
					engine.update();
				}
			});
		});
		
	}
);