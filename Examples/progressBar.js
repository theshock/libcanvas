/*
---

name: "ProgressBar"

description: "ProgressBar"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: ProgressBar

...
*/

LibCanvas.Examples.set('ProgressBar',
	function (canvas) {
		new LibCanvas(canvas, {
			preloadImages: {
				1: '/files/slow-image.php?sleep=1',
				2: '/files/slow-image.php?sleep=2',
				3: '/files/slow-image.php?sleep=3',
				4: '/files/slow-image.php?sleep=4',
				5: '/files/slow-image.php?sleep=5',
				6: '/files/slow-image.php?sleep=6',
				7: '/files/slow-image.php?sleep=7',
				8: '/files/slow-image.php?sleep=8',
				9: '/files/slow-image.php?sleep=9'
			},
			progressBarStyle: {
				width  : 360,
				height :  25,

				bgColor     : '#dbd2cb',
				borderColor : '#6895be',
				barColor    : '#3f3c39',
				barBgColor  : '#a49d95',

				strips     : true,
				stripColor : '#5f86af',
				stripWidth : 25,
				stripShift : 20,
				stripStep  : 50,

				blend        : true,
				blendColor   : '#ffffff',
				blendHeight  : 10,
				blendVAlign  : 5,
				blendOpacity : 0.2
			}
		})
		.size({
			width : 400,
			height: 200
		})
		.start(function () {
			this.ctx.fillAll('#dbd2cb').text({
				text: 'Ready!',
				padding: 20
			});
		});
	}
);