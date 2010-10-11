/*
---
description: Provides interface for clickable canvas objects

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Clickable]
*/ 

(function () {

var setValFn = function (name, val) {
	return function () {
		this[name] = val;
		this.bind('statusChanged');
	}.bind(this);
};

// Should extends drawable, implements mouseListener
LibCanvas.Behaviors.Clickable = new Class({
	clickable : function () {
		this.listenMouse();

		var fn = setValFn.bind(this);

		this.hover  = false;
		this.active = false;

		this.bind('mouseover', fn('hover', true));
		this.bind('mouseout' , fn('hover', false));
		this.bind('mousedown', fn('active', true));
		this.bind(['mouseup', 'away:mouseout', 'away:mouseup'],
			fn('active', false));
		return this;
	}
});
})();