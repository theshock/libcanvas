/*
---

name: "LibCanvas.Inner.FpsMeter"

description: "Constantly calculates frames per seconds rate"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
- "Shock <shocksilien@gmail.com>"

requires:
- LibCanvas
- LibCanvas.Utils.FpsMeter

provides: LibCanvas.Inner.FpsMeter

...
*/
LibCanvas.namespace('Inner').FpsMeter = atom.Class({
	fpsMeter : function (frames) {
		var fpsMeter = new LibCanvas.Utils.FpsMeter(frames || (this.fps ? this.fps / 2 : 10));
		return this.bind('frameRenderStarted', function () {
			fpsMeter.frame();
		});
	}
});