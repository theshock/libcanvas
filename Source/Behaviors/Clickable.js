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

var $window = atom.dom(window);

var setValFn = function (object, name, val) {
	var result = [name, val];
	return function (event) {
		if (object[name] != val) {
			object[name] = val;
			object.fireEvent('statusChanged', result);
		}
	};
};

// Should extends drawable, implements mouseListener
return Class({
	Extends: MouseListener,
	
	hover : false,
	active: false,

	clickable : function (stop, callback) {
		if (typeof stop == 'function') {
			callback = stop;
			stop = false;
		}

		if (callback) this.addEvent( 'statusChanged', callback );

		var callbacks = this['clickable.callbacks'];

		if (!callbacks) {
			var deactivate = setValFn(this, 'active', false);
			callbacks = this['clickable.callbacks'] = {
				'mouseover': setValFn(this, 'hover' , true),
				'mouseout' : setValFn(this, 'hover' , false),
				'mousedown': setValFn(this, 'active', true ),
				'mouseup'      : deactivate,
				'away:mouseup' : deactivate
			};
		}

		if (stop) {
			this.removeEvent(callbacks);
		} else {
			this.addEvent(callbacks);
		}
		return this;
	}
});

}();