/*
---

name: "Context.Path"

description: "Context.Path"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- Examples

provides: Context.Path

...
*/

LibCanvas.Examples.set('Context', function (canvas) {
	var LC = LibCanvas.extract({});

	var context = canvas.getContext('2d-libcanvas');

	// .5 нужно для того, чтобы не блурило

	// Begin/close path, line/moveTo
	new function () {
		context
			.beginPath(20.5, 20.5)
			.lineTo   (20.5, 50.5)
			.lineTo   (50.5, 50.5)
			.lineTo   (50.5, 20.5)
			.closePath(20.5, 20.5)
			.fill('#900')
			.stroke('red');
	};

	// Shape fill/stroke
	new function () {
		var testShape = new LC.Rectangle(60.5, 20.5, 30, 30);
		context
			.fill  (testShape, '#090')
			.stroke(testShape, '#0f0');
	};

	// arc
	new function () {
		var circleCenter = new LC.Point(125, 23);
		context
			.beginPath(circleCenter)
			.arc({
				circle: new LC.Circle({
					center: circleCenter,
					radius: 25
				}),
				angle: {
					start: (65).degree(),
					end  :(170).degree()
				}
			})
			.closePath(circleCenter)
			.fill('#930')
			.stroke('#f90');
	};

	// curveTo
	new function () {
		context
			.save()
			.beginPath(140, 20)
			// bezierCurveTo
			.curveTo({
				to: [170, 50],
				points: [
					[140, 60],
					[150, 20]
				]
			})
			// quadraticCurveTo
			.curveTo({
				to: [140, 20],
				points: [
					[170, 20]
				]
			})
			// drawing
			.closePath()
			.set({ lineWidth: 2 })
			.stroke('royalblue')
			.restore();
	};

	// text
	new function () {
		context.text({
			text  : 'test',
			align : 'right',
			padding: 20,
			color : 'green'
		});
	};

	// draw rotated image
	new function () {
		[10, 40, 70].forEach(function (angle) {
			context.drawImage({
				image: canvas,
				crop : [10, 10, 100, 45],
				draw : [10, 70, 100, 45],
				angle: angle.degree()
			});
		});
	};
});