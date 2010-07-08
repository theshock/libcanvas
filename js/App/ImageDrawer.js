window.App = window.App || {};
(function () {

var tr = new LibCanvas.Utils.Trace();

App.ImageDrawer = new Class({
	Extends : LibCanvas.Interfaces.Drawable,
	draw : function () {
		$('cachedInput').style.display = "block";
		var input = $$('#cachedInput input')[0];
		var ctx   = this.canvas.ctx;
		var image = this.canvas.getImage('cards');
		(13).times(function (rankId) {
			(4).times(function (id) {
				var shift = id == 0 ? [0,0] :
				            id == 1 ? [0,480] :
				            id == 2 ? [300, 0] : [300, 480];
				var method = input.get('checked') ?
					'cachedDrawImage' : 'drawImage';
				// if cached - fps is 200% higher and cpu is not so loaded
				ctx[method]({
					image : image,
					crop : {
						from : {
							x : rankId * (5+59),
							y : 0
						},
						size : [59, 80]
					},
					draw : {
						from : {
							x : 30 + (rankId * 20) + shift[1],
							y : 30 + shift[0]
						},
						size : [120, 160]
					}
				});
			})
		});
	}
});

})();