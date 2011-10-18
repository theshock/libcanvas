/*
---

name: "Behaviors.Clickable"

description: "Provides interface for clickable canvas objects"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.MouseListener

provides: Behaviors.Clickable

...
*/

var Clickable = LibCanvas.Behaviors.Clickable = function () {

var setValFn = function (object, name, val) {
	return function (event) {
		if (typeof event.stop == 'function') event.stop();
		object[name] = val;
		object.fireEvent('statusChanged');
	};
};

// Should extends drawable, implements mouseListener
return Class({
	Extends: MouseListener,

	clickable : function () { 
		this.listenMouse();

		var fn = setValFn.bind(null, this);
		
		this.addEvent('mouseover', fn('hover', true));
		this.addEvent('mouseout' , fn('hover', false));
		this.addEvent('mousedown', fn('active', true));
		this.addEvent(['mouseup', 'away:mouseout', 'away:mouseup'],
			fn('active', false));
		return this;
	}
});

}();