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

var setValFn = function (object, name, val, noEventStop) {
	return function (event) {
		if (!noEventStop && typeof event.stop == 'function') event.stop();
		if (object[name] != val) {
			object[name] = val;
			object.fireEvent('statusChanged');
		}
	};
};

// Should extends drawable, implements mouseListener
return Class({
	Extends: MouseListener,

	clickable : function () { 
		this.listenMouse();
		
		this.addEvent('mouseover', setValFn(this, 'hover' , true ));
		this.addEvent('mouseout' , setValFn(this, 'hover' , false));
		this.addEvent('mousedown', setValFn(this, 'active', true ));
		this.addEvent('mouseup'  , setValFn(this, 'active', false));
		this.addEvent(['away:mouseout', 'away:mouseup'],
			setValFn(this, 'active', false, true));
		return this;
	}
});

}();