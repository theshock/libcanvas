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
		.size(32*6, 32*4, true)
		.addEvent('ready', function () {
			new LibCanvas.Engines.Tile(this.elem)
				.setSize(32, 32)
				.addTiles({
					c: '#030',
					i: this.getImage('sprite'),
					f: function (ctx, rect) {
						ctx.stroke(new Line(rect.from, rect.to), '#66f');
					}
				})
				.setMatrix([
					['c','i','c','c','i','c'],
					['f','f','c','f','f','c'],
					['c','i','i','c','f','i'],
					['c','i','f','c','i','c']
				])
				.update();
		});
		
	}
);