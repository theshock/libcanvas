/*
---

name: "LibCanvas"

description: "LibCanvas - free javascript library, based on AtomJS framework."

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

...
*/

(function (atom, Math) { // LibCanvas

// bug in Safari 5.1 ( 'use strict' + 'set prop' )
// 'use strict';

var undefined,
	/** @global {Object} global */
	global   = this,
	/** @global {Function} slice */
	slice    = [].slice,
	/** @global {Function} declare  */
	declare  = atom.declare,
	/** @global {Function} Registry  */
	Registry = atom.Registry,
	/** @global {Function} Events  */
	Events   = atom.Events,
	/** @global {Function} Settings  */
	Settings = atom.Settings;
/*** [Code] ***/

}).call(typeof window == 'undefined' ? exports : window, atom, Math);