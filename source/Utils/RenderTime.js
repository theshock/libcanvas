/*
---
description: Utility class for render time calculation

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.RenderTime]
*/

LibCanvas.Utils.RenderTime = function (canvas) {
	var frameRenderTime = 0;
	var renderTime = {
		output : [],
		calcul : []
	};
	var timeTrace = [
		new LibCanvas.Utils.Trace,
		new LibCanvas.Utils.Trace,
		new LibCanvas.Utils.Trace
	];
	canvas.bind('frameRenderStarted', function () {
		frameRenderTime = Date.now();
	});
	canvas.bind('frameRenderFinished', function () {
		var output = this.ctx.getRenderTime(1);
		var time   = Date.now() - frameRenderTime;
		if (renderTime.output.length > 50) {
			renderTime.output.shift();
			renderTime.calcul.shift();
		}
		renderTime.output.push(output);
		renderTime.calcul.push(time - output);
		var outputAv = renderTime.output.average();
		var calculAv = renderTime.calcul.average();
		timeTrace[0].trace('Output: ' + outputAv.toFixed(1));
		timeTrace[1].trace('Calcul: ' + calculAv.toFixed(1));
		timeTrace[2].trace('Output of Time: ' + (outputAv / (outputAv+calculAv) * 100).round() + '%');
	});
}