/*
---

name: "Inner.FpsMeter"

description: "Constantly calculates frames per seconds rate"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas
	- Utils.FpsMeter

provides: Inner.FpsMeter

...
*/
LibCanvas.Inner.FpsMeter = atom.Class({
	fpsMeter : function (frames) {
		var fpsMeter = new LibCanvas.Utils.FpsMeter(frames || (this.fps ? this.fps / 2 : 10));
		return this.addEvent('frameRenderStarted', function () {
			fpsMeter.frame();
		});
	}
});