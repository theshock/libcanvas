/*
---

name: "Error"

description: "This will be shown if application is not found"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: Error

...
*/

LibCanvas.Examples.set('Error', function (canvas, app) {
	app = app ? '«' + app + '» ' : '';
	canvas
		.getContext('2d-libcanvas')
		.size({
			width : 200,
			height: 100
		})
		.fillAll('#fcc')
		.text({
			text : 'Application ' + app + 'is not available!',
			align: 'center'
		});
});