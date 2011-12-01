/*
---

name: "Keyboard"

description: "A keyboard control abstraction class"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Keyboard

...
*/

var Keyboard = LibCanvas.Keyboard = function () {

var Keyboard = Class(
/**
 * @lends LibCanvas.Keyboard.prototype
 * @augments Class.Events.prototype
 */
{
	Implements: Class.Events,
	Static: {
		keyCodes : {
			// Alphabet
			a:65, b:66, c:67, d:68, e:69,
			f:70, g:71, h:72, i:73, j:74,
			k:75, l:76, m:77, n:78, o:79,
			p:80, q:81, r:82, s:83, t:84,
			u:85, v:86, w:87, x:88, y:89, z:90,
			// Numbers
			n0:48, n1:49, n2:50, n3:51, n4:52,
			n5:53, n6:54, n7:55, n8:56, n9:57,
			// Controls
			tab:  9, enter:13, shift:16, backspace:8,
			ctrl:17, alt  :18, esc  :27, space    :32,
			menu:93, pause:19, cmd  :91,
			insert  :45, home:36, pageup  :33,
			'delete':46, end :35, pagedown:34,
			// F*
			f1:112, f2:113, f3:114, f4 :115, f5 :116, f6 :117,
			f7:118, f8:119, f9:120, f10:121, f11:122, f12:123,
			// numpad
			np0: 96, np1: 97, np2: 98, np3: 99, np4:100,
			np5:101, np6:102, np7:103, np8:104, np9:105,
			npslash:11,npstar:106,nphyphen:109,npplus:107,npdot:110,
			// Lock
			capslock:20, numlock:144, scrolllock:145,

			// Symbols
			equals: 61, hyphen   :109, coma  :188, dot:190,
			gravis:192, backslash:220, sbopen:219, sbclose:221,
			slash :191, semicolon: 59, apostrophe: 222,

			// Arrows
			aleft:37, aup:38, aright:39, adown:40
		},
		keyStates: {},
		keyState: function (keyName) {
			if (keyName == null) {
				return !!Object.values( this.keyStates ).length;
			} else {
				return this.keyStates[this.keyName(keyName)];
			}
		},
		keyName: function (code) {
			return typeof code == 'string' && code in this.keyCodes ? 
				code : this.key(code);
		},
		// @deprecated
		key: function (code) {
			if ('keyCode' in code) return this.codeNames[code.keyCode];
			return this[typeof code == 'number' ? 'codeNames' : 'keyCodes'][code] || null;
		}
	},
	initialize : function (preventDefault) {
		this.preventDefault = preventDefault;
		
		atom.dom(window).bind({
			keydown:  this.keyEvent('down'),
			keyup:    this.keyEvent('up'),
			keypress: this.keyEvent('press')
		});
	},
	keyEvent: function (event) {
		return function (e) {
			var key = this.self.key(e);
			e.keyName = key;
			this.fireEvent( event, [e] );
			if (event != 'press') {
				if (event == 'down') this.fireEvent(key, [e]);
				if (event == 'up')   this.fireEvent(key + ':up', [e]);
				if (event == 'down') {
					this.self.keyStates[key] = true;
				} else if ( key in this.self.keyStates ) {
					delete this.self.keyStates[key];
				}
			} else {
				this.fireEvent(key + ':press', [e]);
			}
			var prevent = this.prevent(key);
			if (prevent) e.preventDefault();
			this.debugUpdate();
			return !prevent;
		}.bind(this);
	},
	prevent : function (key) {
		var pD = this.preventDefault;
		return pD && (!Array.isArray(pD) || pD.contains(key));
	},
	keyState : function (keyName) {
		return this.self.keyState(keyName);
	},
	_debugTrace: null,
	debugUpdate: function () {
		if (this._debugTrace) {
			var keys = '', states = this.self.keyStates;
			for (var key in states) if (states[key]) {
				keys += '\n = ' + key;
			}
			this._debugTrace.trace( 'Keyboard:' + keys );
		}
		return this;
	},
	debug : function (on) {
		if (on && !this._debugTrace) {
			this._debugTrace = new Trace();
		} else if (on === false) {
			this._debugTrace = null;
		}
		this.debugUpdate();
		return this;
	},
	toString: Function.lambda('[object LibCanvas.Keyboard]')
});

Keyboard.extend({ codeNames: Object.invert(Keyboard.keyCodes) });

return Keyboard;
}();
