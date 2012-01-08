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

var Draggable = function () {


var initDraggable = function () {
	var draggable = this,
		mouse = draggable.libcanvas.mouse,
		dragFn = function ( e ) {
			draggable.shape.move( e.deltaOffset );
			draggable.events.fire('moveDrag', [e.deltaOffset, e]);
		},
		stopDrag  = ['up', 'out'],
		onStopDrag = function (e) {
			if (e.button !== 0) return;

			draggable.events.fire('stopDrag', [ e ]);
			mouse.events
				.remove( 'move', dragFn)
				.remove(stopDrag, onStopDrag);
		}.bind(this);

	draggable.listenMouse();

	draggable.addEvent( 'mousedown' , function (e) {
		if (e.button !== 0) return;

		if (!draggable['draggable.isDraggable']) return;

		draggable.events.add('startDrag', [ e ]);
		mouse.events.add( 'move', dragFn );
		mouse.events.add( stopDrag, onStopDrag );
	});


	return this;
};

return declare( 'LibCanvas.Behaviors.Draggable', {
	draggable : function (stop, callback) {
		if (typeof stop == 'function') {
			callback = stop;
			stop = false;
		}

		if (callback) this.events.add( 'moveDrag', callback );

		if (! ('draggable.isDraggable' in this) ) {
			if (this.libcanvas) {
				initDraggable.call( this );
			} else {
				this.events.add('libcanvasSet', initDraggable);
			}
		}
		this['draggable.isDraggable'] = !stop;
		return this;
	}
});
	
}();