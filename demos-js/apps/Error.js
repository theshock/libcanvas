Apps.Error = new Class({
	initialize : function (libcanvas, app) {
		libcanvas.pause();
		libcanvas.origCtx.fillAll('#fcc').text({
			text  : "Application «{app}» is not available".substitute({app : app}),
			align : 'center'
		});
	}
});