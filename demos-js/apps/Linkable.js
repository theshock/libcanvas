Apps.Linkable = new Class({
	Extends : Interface.Interface,
	run : function () {
		this.shape('circle')
			.link(this.shape('rect'))
			.link(this.shape('rect'));
	},
	shape : function (type, z) {
		return this.helper.createRandomDraggable(type, z);
	}
});