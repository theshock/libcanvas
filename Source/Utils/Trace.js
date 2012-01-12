/*
---

name: "Utils.Trace"

description: "Useful tool which provides windows with user-defined debug information"

license:
	- "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"
	- "[MIT License](http://opensource.org/licenses/mit-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Utils.Trace

...
*/

var Trace = LibCanvas.Utils.Trace = Class({
	Static: {
		dumpRec : function (obj, level, plain) {
			level  = parseInt(level) || 0;
			
			var escape = function (v) {
				return plain ? v : v.safeHtml();
			};

			if (level > 5) return '*TOO_DEEP*';

			if (obj && typeof obj == 'object' && typeof(obj.dump) == 'function') return obj.dump();

			var subDump = function (elem, index) {
					return tabs + '\t' + index + ': ' + this.dumpRec(elem, level+1, plain) + '\n';
				}.bind(this),
				type = atom.typeOf(obj),
				tabs = '\t'.repeat(level);

			switch (type) {
				case 'array':
					return '[\n' + obj.map(subDump).join('') + tabs + ']';
					break;
				case 'object':
					var html = '';
					for (var index in obj) html += subDump(obj[index], index);
					return '{\n' + html + tabs + '}';
				case 'element':
					var prop = (obj.width && obj.height) ? '('+obj.width+'×'+obj.height+')' : '';
					return '[DOM ' + obj.tagName.toLowerCase() + prop + ']';
				case 'textnode':
				case 'whitespace':
					return '[DOM ' + type + ']';
				case 'null':
					return 'null';
				case 'boolean':
					return obj ? 'true' : 'false';
				case 'string':
					return escape('"' + obj + '"');
				default:
					return escape('' + obj);
			}
		},
		dumpPlain: function (object) {
			return (this.dumpRec(object, 0, true));
		},
		dump : function (object) {
			return (this.dumpRec(object, 0));
		}
	},
	initialize : function (object) {
		if (arguments.length) this.trace(object);
		this.stopped = false;
		return this;
	},
	stop  : function () {
		this.stopped = true;
		return this;
	},
	set value (value) {
		if (!this.stopped && !this.blocked) {
			var html = this.self.dump(value)
				.replaceAll({
					'\t': '&nbsp;'.repeat(3),
					'\n': '<br />'
				});
			this.createNode().html(html);
		}
	},
	trace : function (value) {
		this.value = value;
		return this;
	},
	getContainer : function () {
		var cont = atom.dom('#traceContainer');
		return cont.length ? cont :
			atom.dom.create('div', { 'id' : 'traceContainer'})
				.css({
					'zIndex'   : '87223',
					'position' : 'fixed',
					'top'      : '3px',
					'right'    : '6px',
					'maxWidth' : '70%',
					'maxHeight': '100%',
					'overflowY': 'auto',
					'background': 'rgba(0,192,0,0.2)'
				})
				.appendTo('body');
	},
	events : function (remove) {
		var trace = this;
		// add events unbind
		!remove || trace.node.bind({
			mouseover : function () {
				trace.node.css('background', '#222');
			},
			mouseout  : function () {
				trace.node.css('background', '#000');
			},
			mousedown : function () {
				trace.blocked = true;
			},
			mouseup : function () {
				trace.blocked = false;
			}
		});
		return trace.node;
	},
	destroy : function () {
		this.node.css('background', '#300');
		this.timeout = (function () {
			if (this.node) {
				this.node.destroy();
				this.node = null;
			}
		}.delay(500, this));
		return this;
	},
	createNode : function () {
		if (this.node) {
			if (this.timeout) {
				this.timeout.stop();
				this.events(this.node);
				this.node.css('background', '#000');
			}
			return this.node;
		}

		this.node = atom.dom
			.create('div')
			.css({
				background : '#000',
				border     : '1px dashed #0c0',
				color      : '#0c0',
				cursor     : 'pointer',
				fontFamily : 'monospace',
				margin     : '1px',
				minWidth   : '200px',
				overflow   : 'auto',
				padding    : '3px 12px',
				whiteSpace : 'pre'
			})
			.appendTo(this.getContainer())
			.bind({
				click    : this.destroy.bind(this),
				dblclick : function () { this.stop().destroy(); }.bind(this)
			});
		return this.events();
	},
	toString: Function.lambda('[object LibCanvas.Utils.Trace]')
});

try {
	window.trace = function (msg) {
		var L = arguments.length;
		if (L > 0) {
			if (L > 1) msg = atom.toArray(arguments);
			return new Trace(msg);
		} else {
			return new Trace();
		}
	};
} catch (ignored) {}