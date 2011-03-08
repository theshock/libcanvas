/*
---

name: "Utils.Trace"

description: "Useful tool which provides windows with user-defined debug information"

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

authors:
	- "Shock <shocksilien@gmail.com>"

requires:
	- LibCanvas

provides: Utils.Trace

...
*/

new function () {

var Trace = LibCanvas.namespace('Utils').Trace = atom.Class({
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
			var html = this.dump(value)
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
	dumpRec : function (obj, level) {
		level  = parseInt(level) || 0
			
		if (level > 5) return '*TOO_DEEP*';
		
		if (typeof obj == 'object' && typeof(obj.dump) == 'function') return obj.dump();
		
		var subDump = function (elem, index) {
				return tabs + '\t' + index + ': ' + this.dumpRec(elem, level+1) + '\n';
			}.context(this),
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
				return ('"' + obj + '"').safeHtml();
			default:
				return ('' + obj).safeHtml();
		}
	},
	dump : function (object) {
		return (this.dumpRec(object, 0));
	},
	getContainer : function () {
		var cont = atom('#traceContainer');
		return cont.length ? cont :
			atom().create('div', { 'id' : 'traceContainer'})
				.css({
					'position' : 'absolute',
					'top'      : '3px',
					'right'    : '6px',
					'maxWidth' : '70%'
				})
				.appendTo('body');
	},
	events : function (remove) {
		var trace = this;
		// add events unbind
		!remove || this.node.bind({
			mouseover : function () {
				this.css('background', '#222');
			},
			mouseout  : function () {
				this.css('background', '#000');
			},
			mousedown : function () {
				trace.blocked = true;
			},
			mouseup : function () {
				trace.blocked = false;
			}
		});
		return this.node;
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

		this.node = atom()
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
				click    : this.destroy.context(this),
				dblclick : function () { this.stop().destroy(); }.context(this)
			});
		return this.events();
	},
	toString: Function.lambda('[object LibCanvas.Utils.Trace]')
});

window.trace = function (msg) {
	var L = arguments.length;
	if (L > 0) {
		if (L > 1) msg = atom.toArray(arguments);
		return new Trace(msg);
	} else {
		return new Trace();
	}
};

}();