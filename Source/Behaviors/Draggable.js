/*
---

name: "Behaviors.Draggable"

description: "When object implements LibCanvas.Behaviors.Draggable interface dragging made possible"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Behaviors.MouseListener

provides: Behaviors.Draggable

...
*/

var Draggable = LibCanvas.Behaviors.Draggable = function () {


var initDraggable = function () {
	var draggable = this,
		mouse = draggable.libcanvas.mouse,
		dragFn = function ( e ) {
			draggable.shape.move( e.deltaOffset );
			draggable.fireEvent('moveDrag', [e.deltaOffset, e]);
		},
		stopDrag  = ['up', 'out'],
		onStopDrag = function (e) {
			if (e.button !== 0) return;

			draggable.fireEvent('stopDrag', [ e ]);
			mouse
				.removeEvent( 'move', dragFn)
				.removeEvent(stopDrag, onStopDrag);
		}.bind(this);

	draggable.listenMouse();

	draggable.addEvent( 'mousedown' , function (e) {
		if (e.button !== 0) return;

		if (!draggable['draggable.isDraggable']) return;

		draggable.fireEvent('startDrag', [ e ]);
		mouse
			.addEvent( 'move', dragFn )
			.addEvent( stopDrag, onStopDrag );
	});


	return this;
};

return Class({
	Extends: MouseListener,

	draggable : function (stop, callback) {
		if (typeof stop == 'function') {
			callback = stop;
			stop = false;
		}

		if (callback) this.addEvent( 'moveDrag', callback );

		if (! ('draggable.isDraggable' in this) ) {
			if (this.libcanvas) {
				initDraggable.call( this );
			} else {
				this.addEvent('libcanvasSet', initDraggable);
			}
		}
		this['draggable.isDraggable'] = !stop;
		return this;
	}
});
	
}();